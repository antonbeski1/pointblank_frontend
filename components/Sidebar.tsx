
import React, { useState } from 'react';
import { LogoIcon, ChartIcon, ImageIcon, MessageIcon, ArrowRightIcon } from './icons';

interface SidebarProps {
  onAnalysis: (ticker: string) => void;
  isLoading: boolean;
  activeView: 'dashboard' | 'imageAnalyzer' | 'chatbot';
  setActiveView: (view: 'dashboard' | 'imageAnalyzer' | 'chatbot') => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void;}> = ({ icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary/20 text-primary' : 'hover:bg-surface text-text-secondary'}`}
  >
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </button>
);


export const Sidebar: React.FC<SidebarProps> = ({ onAnalysis, isLoading, activeView, setActiveView }) => {
  const [ticker, setTicker] = useState('GOOGL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      setActiveView('dashboard');
      onAnalysis(ticker.trim().toUpperCase());
    }
  };

  return (
    <aside className="w-72 bg-black h-screen flex flex-col p-4 border-r border-border fixed">
      <div className="flex items-center gap-3 mb-8">
        <LogoIcon className="w-8 h-8" />
        <h1 className="text-xl font-bold text-text-primary">Point.Blank AI</h1>
      </div>

      <nav className="flex flex-col space-y-2 mb-8">
        <NavItem icon={<ChartIcon className="w-5 h-5" />} label="Stock Dashboard" isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
        <NavItem icon={<ImageIcon className="w-5 h-5" />} label="Image Analyzer" isActive={activeView === 'imageAnalyzer'} onClick={() => setActiveView('imageAnalyzer')} />
        <NavItem icon={<MessageIcon className="w-5 h-5" />} label="Chatbot" isActive={activeView === 'chatbot'} onClick={() => setActiveView('chatbot')} />
      </nav>

      <div className="border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-text-secondary mb-3 px-2">ANALYZE STOCK</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ticker-input" className="text-xs text-text-secondary font-medium mb-1 block">Ticker Symbol</label>
            <input
              id="ticker-input"
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="e.g., AAPL, TSLA"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white font-semibold rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-blue-600 transition disabled:bg-secondary disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Run Analysis'}
            {!isLoading && <ArrowRightIcon />}
          </button>
        </form>
      </div>

      <div className="mt-auto text-xs text-text-secondary text-center">
        <p>Powered by Google Gemini</p>
        <p>&copy; 2024 Point.Blank Inc.</p>
      </div>
    </aside>
  );
};
