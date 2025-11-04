
import React, { useEffect, useState } from 'react';
import type { StockData, Forecast, ActiveIndicators } from '../types';
import { RefreshIcon } from './icons';

// Dynamically import Plotly to avoid SSR issues
import createPlotlyComponent from 'react-plotly.js/factory';

// Fix: Declare Plotly on the window object for TypeScript
declare global {
  interface Window {
    Plotly: any;
  }
}

const Plot = createPlotlyComponent(window.Plotly);

interface StockChartProps {
  history: StockData[];
  forecasts: Forecast[];
  ticker: string;
  currency: string;
  activeIndicators: ActiveIndicators;
  onRetry: () => void;
}

export const StockChart: React.FC<StockChartProps> = ({ history, forecasts, ticker, currency, activeIndicators, onRetry }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="bg-surface rounded-lg p-4 h-96 flex items-center justify-center text-text-secondary">Loading Chart...</div>;
    }

    if (!history || history.length === 0) {
        return (
            <div className="bg-surface rounded-lg p-8 h-96 flex flex-col items-center justify-center text-center border border-red-500/30">
                <h3 className="text-xl font-semibold text-red-400 mb-2">Chart Data Unavailable</h3>
                <p className="text-text-secondary mb-4 max-w-sm">We couldn't load the historical data for this stock. This might be a temporary issue with the data source.</p>
                <button
                    onClick={onRetry}
                    className="bg-primary text-white font-semibold rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-blue-600 transition"
                >
                    <RefreshIcon className="w-4 h-4" />
                    Retry Analysis
                </button>
            </div>
        );
    }
    
    const { bb, rsi, macd } = activeIndicators;
    const subplots = [rsi, macd].filter(Boolean).length;

    const mainHeight = 0.55; // 55% for main chart
    const subplotHeight = subplots > 0 ? (1 - mainHeight - 0.05) / subplots : 0;
    const gap = 0.05;

    const candlestickTrace = {
        x: history.map(d => d.Date),
        open: history.map(d => d.Open),
        high: history.map(d => d.High),
        low: history.map(d => d.Low),
        close: history.map(d => d.Close),
        type: 'candlestick',
        name: ticker,
        increasing: { line: { color: '#16c784' } },
        decreasing: { line: { color: '#ea3943' } },
        yaxis: 'y1',
    };

    const volumeTrace = {
        x: history.map(d => d.Date),
        y: history.map(d => d.Volume),
        type: 'bar',
        name: 'Volume',
        marker: {
            color: history.map((d, i) => d.Close >= (history[i-1]?.Close || d.Open) ? 'rgba(22, 199, 132, 0.4)' : 'rgba(234, 57, 67, 0.4)')
        },
        yaxis: 'y2',
    };
    
    const forecastTraces = forecasts.map(f => ({
        x: f.data.map(d => d.Date),
        y: f.data.map(d => d.yhat),
        type: 'scatter',
        mode: 'lines',
        name: `${f.model} Forecast`,
        line: { dash: 'dot', width: 2 },
        yaxis: 'y1',
    }));

    const dataTraces: any[] = [candlestickTrace, volumeTrace, ...forecastTraces];
    let layout: any = {
        plot_bgcolor: '#1C1C1E',
        paper_bgcolor: '#1C1C1E',
        font: { color: '#FFFFFF' },
        xaxis: {
            rangeslider: { visible: false },
            gridcolor: '#38383A',
        },
        yaxis: {
            domain: [subplots > 0 ? 1 - mainHeight : 0, 1],
            title: `Price (${currency})`,
            gridcolor: '#38383A',
        },
        yaxis2: {
            title: 'Volume',
            domain: [subplots > 0 ? 1 - mainHeight : 0, 1],
            overlaying: 'y',
            side: 'right',
            showgrid: false,
            showticklabels: false,
        },
        showlegend: true,
        legend: {
            orientation: 'h', yanchor: 'bottom', y: 1.02, xanchor: 'right', x: 1,
        },
        margin: { t: 50, b: 20, l: 50, r: 50 },
        shapes: [],
        hovermode: 'x unified',
    };

    if (bb) {
        dataTraces.push({ x: history.map(d => d.Date), y: history.map(d => d.bb_upper), type: 'scatter', mode: 'lines', name: 'BB Upper', line: { color: 'rgba(41, 98, 255, 0.5)', width: 1 }, yaxis: 'y1' });
        dataTraces.push({ x: history.map(d => d.Date), y: history.map(d => d.bb_lower), type: 'scatter', mode: 'lines', name: 'BB Lower', line: { color: 'rgba(41, 98, 255, 0.5)', width: 1 }, fill: 'tonexty', fillcolor: 'rgba(41, 98, 255, 0.1)', yaxis: 'y1' });
        dataTraces.push({ x: history.map(d => d.Date), y: history.map(d => d.bb_middle), type: 'scatter', mode: 'lines', name: 'BB Middle', line: { color: 'rgba(255, 167, 38, 0.7)', width: 1, dash: 'dash' }, yaxis: 'y1' });
    }
    
    let currentSubplotIndex = 1;
    
    if (rsi) {
        const yAxisIndex = currentSubplotIndex + 2;
        const domainStart = (currentSubplotIndex - 1) * (subplotHeight + gap);
        const domainEnd = domainStart + subplotHeight;
        layout[`yaxis${yAxisIndex}`] = { domain: [domainStart, domainEnd], title: 'RSI', gridcolor: '#38383A', dtick: 40, range: [0, 100] };
        dataTraces.push({ x: history.map(d => d.Date), y: history.map(d => d.rsi), type: 'scatter', mode: 'lines', name: 'RSI', yaxis: `y${yAxisIndex}`, line: { color: '#c57aff' } });
        layout.shapes.push({ type: 'line', xref: 'paper', x0: 0, x1: 1, yref: `y${yAxisIndex}`, y0: 70, y1: 70, line: { color: '#ea3943', width: 1, dash: 'dash' } });
        layout.shapes.push({ type: 'line', xref: 'paper', x0: 0, x1: 1, yref: `y${yAxisIndex}`, y0: 30, y1: 30, line: { color: '#16c784', width: 1, dash: 'dash' } });
        currentSubplotIndex++;
    }

    if (macd) {
        const yAxisIndex = currentSubplotIndex + 2;
        const domainStart = (currentSubplotIndex - 1) * (subplotHeight + gap);
        const domainEnd = domainStart + subplotHeight;
        layout[`yaxis${yAxisIndex}`] = { domain: [domainStart, domainEnd], title: 'MACD', gridcolor: '#38383A' };
        dataTraces.push({ x: history.map(d => d.Date), y: history.map(d => d.macd_hist), type: 'bar', name: 'MACD Hist', yaxis: `y${yAxisIndex}`, marker: { color: history.map(d => (d.macd_hist ?? 0) >= 0 ? 'rgba(22, 199, 132, 0.5)' : 'rgba(234, 57, 67, 0.5)') } });
        dataTraces.push({ x: history.map(d => d.Date), y: history.map(d => d.macd), type: 'scatter', mode: 'lines', name: 'MACD', yaxis: `y${yAxisIndex}`, line: { color: '#0A84FF' } });
        dataTraces.push({ x: history.map(d => d.Date), y: history.map(d => d.macd_signal), type: 'scatter', mode: 'lines', name: 'Signal', yaxis: `y${yAxisIndex}`, line: { color: '#ff6d00' } });
        currentSubplotIndex++;
    }
    
    const chartHeight = 500 + (subplots * 120);

    return (
        <div className="bg-surface rounded-lg p-2 border border-border">
            <Plot
                data={dataTraces as any}
                layout={layout as any}
                useResizeHandler={true}
                style={{ width: '100%', height: `${chartHeight}px` }}
                config={{ responsive: true, displaylogo: false }}
            />
        </div>
    );
};
