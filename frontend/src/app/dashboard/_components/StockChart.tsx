'use client';
import React, { useEffect, useState, ComponentType } from 'react';
import type { StockData, Forecast } from '@/types';

// Dynamically import Plotly to avoid SSR issues
import createPlotlyComponent from 'react-plotly.js/factory';

let Plot: ComponentType<any> | undefined = undefined;

interface StockChartProps {
  history: StockData[];
  forecasts: Forecast[];
  ticker: string;
  currency: string;
}

export const StockChart: React.FC<StockChartProps> = ({ history, forecasts, ticker, currency }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // This check ensures Plotly is only loaded on the client side
        if (typeof window !== 'undefined') {
            import('plotly.js').then(Plotly => {
                Plot = createPlotlyComponent(Plotly);
                setIsClient(true);
            });
        }
    }, []);

    if (!isClient || !Plot || !history.length) {
        return <div className="bg-surface rounded-lg p-4 h-96 flex items-center justify-center text-text-secondary border border-border">Loading Chart...</div>;
    }

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
        line: { dash: 'dot', width: 2 }
    }));

    const layout = {
        title: `${ticker} Price Action`,
        plot_bgcolor: '#1C1C1E',
        paper_bgcolor: '#1C1C1E',
        font: { color: '#FFFFFF' },
        xaxis: {
            rangeslider: { visible: false },
            gridcolor: '#38383A',
        },
        yaxis: {
            title: `Price (${currency})`,
            gridcolor: '#38383A',
        },
        yaxis2: {
            title: 'Volume',
            overlaying: 'y',
            side: 'right',
            showgrid: false,
            showticklabels: false
        },
        showlegend: true,
        legend: {
            orientation: 'h',
            yanchor: 'bottom',
            y: 1.02,
            xanchor: 'right',
            x: 1,
        },
        margin: { t: 50, b: 50, l: 50, r: 50 }
    };

    return (
        <div className="bg-surface rounded-lg p-2 border border-border">
            <Plot
                data={[candlestickTrace, volumeTrace, ...forecastTraces]}
                layout={layout}
                useResizeHandler={true}
                style={{ width: '100%', height: '500px' }}
                config={{ responsive: true, displaylogo: false }}
            />
        </div>
    );
};
