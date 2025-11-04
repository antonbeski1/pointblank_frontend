'use client';
import React from 'react';
import { StockChart } from './_components/StockChart';
import { AnalysisCards } from './_components/AnalysisCards';
import { Forecasts } from './_components/Forecasts';
import { News } from './_components/News';
import { ImageAnalyzer } from './_components/ImageAnalyzer';
import { Chatbot } from './_components/Chatbot';
import { SubscriptionModal } from './_components/SubscriptionModal';
import { LogoIcon, ChartIcon, AnalysisIcon, ForecastIcon, NewsIcon, BrainIcon } from '@/components/icons';
import { useDashboardState } from '@/hooks/useDashboardState';


const DashboardPage: React.FC = () => {
  const {
    stockInfo,
    isLoading,
    error,
    activeView,
    showSubscriptionModal,
    setShowSubscriptionModal,
    handleSubscribe,
  } = useDashboardState();


  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8">
      <LogoIcon className="w-20 h-20 sm:w-24 sm:h-24 mb-6" />
      <h1 className="text-2xl sm:text-4xl font-bold text-text-primary mb-2">Welcome to Point.Blank AI Analyst</h1>
      <p className="text-base sm:text-lg text-text-secondary max-w-2xl">
        Enter a stock ticker in the sidebar to get started. Access real-time data, technical analysis, AI-powered forecasts, and the latest news.
      </p>
    </div>
  );
  
  const renderDashboard = () => (
    <>
      {stockInfo ? (
        <div className="space-y-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary flex items-center gap-2"><ChartIcon /> Price Chart &amp; Indicators</h2>
          <StockChart history={stockInfo.history} forecasts={stockInfo.forecasts} ticker={stockInfo.ticker} currency={stockInfo.currency} />
          
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary flex items-center gap-2"><AnalysisIcon /> Technical Analysis</h2>
          <AnalysisCards analysis={stockInfo.analysis} currency={stockInfo.currency} />

          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary flex items-center gap-2"><BrainIcon /> Gemini Deep Analysis</h2>
          <div className="bg-surface p-4 md:p-6 rounded-lg border border-border prose prose-sm md:prose-base prose-invert max-w-none">
             <div dangerouslySetInnerHTML={{ __html: stockInfo.deepAnalysis }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-4 flex items-center gap-2"><ForecastIcon /> AI Forecasts</h2>
              <Forecasts forecasts={stockInfo.forecasts} currency={stockInfo.currency}/>
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-4 flex items-center gap-2"><NewsIcon /> Latest News</h2>
              <News articles={stockInfo.news} />
            </div>
          </div>
        </div>
      ) : renderWelcome()}
    </>
  );

  const renderActiveView = () => {
    if (isLoading) {
       return (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                 <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-text-secondary text-lg">Gemini is analyzing... this may take a moment.</p>
              </div>
            </div>
          )
    }
    if (error) {
       return (
            <div className="flex items-center justify-center h-full">
               <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-lg text-center max-w-md">
                <h3 className="font-bold text-lg mb-2">Analysis Failed</h3>
                <p>{error}</p>
              </div>
            </div>
          )
    }

    switch(activeView) {
      case 'dashboard': return renderDashboard();
      case 'imageAnalyzer': return <ImageAnalyzer />;
      case 'chatbot': return <Chatbot />;
      default: return renderDashboard();
    }
  }

  return (
    <>
        {renderActiveView()}
        {showSubscriptionModal && <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} onSubscribe={handleSubscribe} />}
    </>
  );
};

export default DashboardPage;