'use client';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ANALYSIS_LIMIT } from '@/constants';
import { ZapIcon, CheckCircleIcon, MenuIcon } from '@/components/icons';
import { useDashboardState } from '@/hooks/useDashboardState';
import { useSidebar } from '@/contexts/SidebarContext';


export const Header: React.FC = () => {
  const { profile } = useAuth();
  const { stockInfo } = useDashboardState();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-black/50 backdrop-blur-sm border-b border-border p-4 flex justify-between items-center sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden text-text-primary">
          <MenuIcon />
        </button>
        {stockInfo ? (
           <h1 className="text-lg md:text-xl font-bold text-text-primary">{stockInfo.companyName} ({stockInfo.ticker})</h1>
        ) : (
           <h1 className="text-lg md:text-xl font-bold text-text-primary">Dashboard</h1>
        )}
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        {profile?.isSubscribed ? (
          <div className="flex items-center gap-2 text-xs sm:text-sm bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full font-medium">
            <CheckCircleIcon />
            <span className="hidden sm:inline">Pro Member</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs sm:text-sm bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded-full font-medium">
            <ZapIcon />
            <span>{Math.max(0, ANALYSIS_LIMIT - (profile?.analysisCount || 0))} <span className="hidden sm:inline">left</span></span>
          </div>
        )}
      </div>
    </header>
  );
};