
import React from 'react';
import { XIcon, CheckCircleIcon, ZapIcon } from './icons';

interface SubscriptionModalProps {
  onClose: () => void;
  onSubscribe: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, onSubscribe }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-xl border border-border p-8 max-w-md w-full relative transform transition-all scale-100 opacity-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
          <XIcon />
        </button>

        <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-4">
                <ZapIcon className="w-8 h-8 text-primary"/>
            </div>
          <h2 className="text-2xl font-bold text-text-primary">Unlock Unlimited Analyses</h2>
          <p className="text-text-secondary mt-2">You've reached your free analysis limit. Subscribe to get unlimited access to all features.</p>
        </div>

        <div className="bg-secondary/30 rounded-lg p-6 my-6 text-left">
            <h3 className="font-semibold text-text-primary mb-4">Point.Blank Pro Includes:</h3>
            <ul className="space-y-3">
                <li className="flex items-center gap-3"><CheckCircleIcon className="text-green-500"/> Unlimited Stock Analyses</li>
                <li className="flex items-center gap-3"><CheckCircleIcon className="text-green-500"/> Advanced AI Forecasting Models</li>
                <li className="flex items-center gap-3"><CheckCircleIcon className="text-green-500"/> Gemini Deep Analysis Mode</li>
                <li className="flex items-center gap-3"><CheckCircleIcon className="text-green-500"/> Priority Access to New Features</li>
            </ul>
        </div>
        
        <button 
            onClick={onSubscribe}
            className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105"
        >
          Subscribe Now - ₹999/month
        </button>
        <p className="text-xs text-text-secondary mt-3 text-center">
            This is a demo. Clicking subscribe will grant you full access. No payment will be processed.
        </p>

      </div>
    </div>
  );
};
