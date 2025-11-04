
import React from 'react';
import { ANALYSIS_LIMIT } from '../constants';
import { ZapIcon, CheckCircleIcon } from './icons';

interface HeaderProps {
  isSubscribed: boolean;
  analysisCount: number;
  ticker: string | null;
  companyName: string | null;
}

export const Header: React.FC<HeaderProps> = ({ isSubscribed, analysisCount, ticker, companyName }) => {
  return (
    <header className="pl-72 bg-black/50 backdrop-blur-sm border-b border-border p-4 flex justify-between items-center sticky top-0 z-10">
      <div>
        {ticker && companyName ? (
           <h1 className="text-xl font-bold text-text-primary">{companyName} ({ticker})</h1>
        ) : (
           <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
        )}
      </div>
      <div className="flex items-center gap-4">
        {isSubscribed ? (
          <div className="flex items-center gap-2 text-sm bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full font-medium">
            <CheckCircleIcon />
            <span>Subscribed</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded-full font-medium">
            <ZapIcon />
            <span>{ANALYSIS_LIMIT - analysisCount} analyses remaining</span>
          </div>
        )}
      </div>
    </header>
  );
};
