'use client';
import React, { useState, createContext, useContext, ReactNode, useCallback } from 'react';
import type { FullStockInfo } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import { ANALYSIS_LIMIT } from '@/constants';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type View = 'dashboard' | 'imageAnalyzer' | 'chatbot';

interface DashboardStateContextType {
  stockInfo: FullStockInfo | null;
  isLoading: boolean;
  error: string | null;
  activeView: View;
  setActiveView: (view: View) => void;
  handleAnalysis: (ticker: string) => Promise<void>;
  showSubscriptionModal: boolean;
  setShowSubscriptionModal: (show: boolean) => void;
  handleSubscribe: () => Promise<void>;
}

const DashboardStateContext = createContext<DashboardStateContextType | undefined>(undefined);

export const DashboardStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stockInfo, setStockInfo] = useState<FullStockInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { profile, refreshProfile } = useAuth();

  const handleAnalysis = useCallback(async (ticker: string) => {
    if (profile && !profile.isSubscribed && profile.analysisCount >= ANALYSIS_LIMIT) {
      setShowSubscriptionModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setStockInfo(null);
    try {
      const { data: allInfo } = await api.post<FullStockInfo>('/api/analyze/', { ticker });
      setStockInfo(allInfo);
      // Fetches updated analysisCount
      await refreshProfile();
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.error || e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [profile, refreshProfile]);
  
  const handleSubscribe = async () => {
    try {
      const { data: { order } } = await api.post('/api/subscribe/');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Point.Blank Pro',
        description: 'Unlimited AI Analysis',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            await api.post('/api/verify-subscription/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await refreshProfile();
            setShowSubscriptionModal(false);
          } catch (e) {
            console.error('Verification failed', e);
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          email: profile?.email,
        },
        theme: {
          color: '#0A84FF',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Subscription failed', error);
      setError(error.response?.data?.error || 'Could not initiate subscription. Please try again later.');
    }
  };

  const value = {
    stockInfo,
    isLoading,
    error,
    activeView,
    setActiveView,
    handleAnalysis,
    showSubscriptionModal,
    setShowSubscriptionModal,
    handleSubscribe,
  };

  // Fix: Replaced JSX with React.createElement to prevent parsing errors in a .ts file.
  return React.createElement(DashboardStateContext.Provider, { value: value }, children);
};

export const useDashboardState = () => {
  const context = useContext(DashboardStateContext);
  if (context === undefined) {
    throw new Error('useDashboardState must be used within a DashboardStateProvider');
  }
  return context;
};
