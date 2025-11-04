
import React from 'react';
import type { Analysis } from '../types';
import { formatCurrency, formatNumber, getSignalColor, getSignalIcon } from '../utils/formatters';

interface AnalysisCardsProps {
  analysis: Analysis;
  currency: string;
}

const Card: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
  <div className="bg-surface p-4 rounded-lg border border-border flex flex-col">
    <h3 className="text-sm font-semibold text-text-secondary mb-3">{title}</h3>
    <div className="flex-grow space-y-2">{children}</div>
  </div>
);

const Metric: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
  <div className="flex justify-between items-baseline">
    <span className="text-sm text-text-secondary">{label}</span>
    <span className={`text-base font-semibold text-text-primary ${className}`}>{value}</span>
  </div>
);

export const AnalysisCards: React.FC<AnalysisCardsProps> = ({ analysis, currency }) => {
  const { overall, price, moving_averages, rsi, macd } = analysis;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card title="Overall Signal">
        <div className="text-center my-auto">
          <div className={`text-6xl mx-auto w-fit mb-2 ${getSignalColor(overall.signal)}`}>{getSignalIcon(overall.signal)}</div>
          <p className={`text-2xl font-bold ${getSignalColor(overall.signal)}`}>{overall.signal}</p>
          <p className="text-sm text-text-secondary">Score: {formatNumber(overall.score)}/100</p>
        </div>
      </Card>

      <Card title="Price Action">
        <Metric label="Current Price" value={formatCurrency(price.current, currency)} />
        <Metric 
          label="Change" 
          value={`${formatCurrency(price.change, currency)} (${price.change_pct.toFixed(2)}%)`}
          className={price.change >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <Metric 
          label="Trend" 
          value={price.trend}
          className={price.trend === 'Bullish' ? 'text-green-400' : price.trend === 'Bearish' ? 'text-red-400' : 'text-yellow-400'}
        />
      </Card>

      <Card title="Moving Averages">
        <Metric label="SMA 20" value={formatCurrency(moving_averages.sma_20, currency)} />
        <Metric label="SMA 50" value={formatCurrency(moving_averages.sma_50, currency)} />
        <Metric 
            label="Signal" 
            value={moving_averages.signal}
            className={moving_averages.signal.includes('Bullish') ? 'text-green-400' : moving_averages.signal.includes('Bearish') ? 'text-red-400' : 'text-yellow-400'}
        />
      </Card>
      
      <Card title="Oscillators">
        <Metric 
            label="RSI (14)" 
            value={`${formatNumber(rsi.value)} - ${rsi.signal}`}
            className={rsi.signal === 'Oversold' ? 'text-green-400' : rsi.signal === 'Overbought' ? 'text-red-400' : 'text-yellow-400'}
        />
        <Metric 
            label="MACD Trend" 
            value={macd.trend}
            className={macd.trend === 'Bullish' ? 'text-green-400' : macd.trend === 'Bearish' ? 'text-red-400' : 'text-yellow-400'}
        />
         <Metric label="MACD Line" value={formatNumber(macd.macd)} />
      </Card>
    </div>
  );
};
