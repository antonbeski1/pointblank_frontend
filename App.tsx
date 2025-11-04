
import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StockChart } from './components/StockChart';
import { AnalysisCards } from './components/AnalysisCards';
import { Forecasts } from './components/Forecasts';
import { News } from './components/News';
import { ImageAnalyzer } from './components/ImageAnalyzer';
import { Chatbot } from './components/Chatbot';
import { SubscriptionModal } from './components/SubscriptionModal';
import { IndicatorControls } from './components/IndicatorControls';
import { fetchStockDataAndAnalysis, generateForecasts, fetchNews, generateDeepAnalysis } from './services/geminiService';
import type { StockData, Analysis, Forecast, NewsArticle, FullStockInfo, ActiveIndicators } from './types';
import { ANALYSIS_LIMIT } from './constants';
import { LogoIcon, ChartIcon, AnalysisIcon, ForecastIcon, NewsIcon, BrainIcon, ImageIcon, MessageIcon } from './components/icons';

type View = 'dashboard' | 'imageAnalyzer' | 'chatbot';

const App: React.FC = () => {
  const [stockInfo, setStockInfo] = useState<FullStockInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [activeIndicators, setActiveIndicators] = useState<ActiveIndicators>({ bb: false, rsi: true, macd: true });

  const handleAnalysis = useCallback(async (ticker: string) => {
    if (!isSubscribed && analysisCount >= ANALYSIS_LIMIT) {
      setShowSubscriptionModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    // Keep existing stockInfo to allow retry on the chart
    if (stockInfo?.ticker !== ticker) {
        setStockInfo(null);
    }

    try {
      const allInfo = await fetchStockDataAndAnalysis(ticker);
      
      const [forecasts, news, deepAnalysis] = await Promise.all([
        generateForecasts(ticker, allInfo.history),
        fetchNews(ticker),
        generateDeepAnalysis(ticker),
      ]);

      setStockInfo({
        ...allInfo,
        forecasts,
        news,
        deepAnalysis,
      });

      if (!isSubscribed) {
        setAnalysisCount(prev => prev + 1);
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [analysisCount, isSubscribed, stockInfo?.ticker]);

  const handleSubscribe = () => {
    setIsSubscribed(true);
    setAnalysisCount(0);
    setShowSubscriptionModal(false);
  };

  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <LogoIcon className="w-24 h-24 mb-6" />
      <h1 className="text-4xl font-bold text-text-primary mb-2">Welcome to Point.Blank AI Analyst</h1>
      <p className="text-lg text-text-secondary max-w-2xl">
        Enter a stock ticker in the sidebar to get started. Access real-time data, technical analysis, AI-powered forecasts, and the latest news.
      </p>
    </div>
  );
  
  const renderDashboard = () => (
    <>
      {stockInfo ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
             <h2 className="text-3xl font-bold text-text-primary flex items-center gap-2 shrink-0"><ChartIcon /> Price Chart</h2>
             <IndicatorControls activeIndicators={activeIndicators} setActiveIndicators={setActiveIndicators} />
          </div>
          <StockChart 
             history={stockInfo.history} 
             forecasts={stockInfo.forecasts} 
             ticker={stockInfo.ticker} 
             currency={stockInfo.currency} 
             activeIndicators={activeIndicators}
             onRetry={() => handleAnalysis(stockInfo.ticker)}
          />
          
          <h2 className="text-3xl font-bold text-text-primary flex items-center gap-2"><AnalysisIcon /> Technical Analysis</h2>
          <AnalysisCards analysis={stockInfo.analysis} currency={stockInfo.currency} />

          <h2 className="text-3xl font-bold text-text-primary flex items-center gap-2"><BrainIcon /> Gemini Deep Analysis</h2>
          <div className="bg-surface p-6 rounded-lg border border-border prose prose-invert max-w-none text-text-primary">
             <div dangerouslySetInnerHTML={{ __html: stockInfo.deepAnalysis }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-4 flex items-center gap-2"><ForecastIcon /> AI Forecasts</h2>
              <Forecasts forecasts={stockInfo.forecasts} currency={stockInfo.currency}/>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-4 flex items-center gap-2"><NewsIcon /> Latest News</h2>
              <News articles={stockInfo.news} />
            </div>
          </div>
        </div>
      ) : renderWelcome()}
    </>
  );

  const renderActiveView = () => {
    switch(activeView) {
      case 'dashboard': return renderDashboard();
      case 'imageAnalyzer': return <ImageAnalyzer />;
      case 'chatbot': return <Chatbot />;
      default: return renderDashboard();
    }
  }


  return (
    <div className="bg-background min-h-screen text-text-primary font-sans flex">
      <Sidebar 
        onAnalysis={handleAnalysis} 
        isLoading={isLoading} 
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <main className="flex-1 flex flex-col h-screen">
        <Header 
          isSubscribed={isSubscribed}
          analysisCount={analysisCount}
          ticker={stockInfo?.ticker}
          companyName={stockInfo?.companyName}
        />
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                 <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-text-secondary text-lg">Gemini is analyzing... this may take a moment.</p>
              </div>
            </div>
          )}
          {!isLoading && error && (
            <div className="flex items-center justify-center h-full">
               <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-lg text-center">
                <h3 className="font-bold text-lg mb-2">Analysis Failed</h3>
                <p>{error}</p>
              </div>
            </div>
          )}
          {!isLoading && !error && renderActiveView()}
        </div>
      </main>
      {showSubscriptionModal && <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} onSubscribe={handleSubscribe} />}
    </div>
  );
};

export default App;
