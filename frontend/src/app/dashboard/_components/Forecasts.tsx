import React from 'react';
import type { Forecast } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ChevronDownIcon } from '@/components/icons';

interface ForecastsProps {
  forecasts: Forecast[];
  currency: string;
}

const ForecastItem: React.FC<{ forecast: Forecast; currency: string; }> = ({ forecast, currency }) => {
  return (
    <details className="bg-surface border border-border rounded-lg overflow-hidden group">
      <summary className="p-4 cursor-pointer flex justify-between items-center hover:bg-secondary transition-colors">
        <h4 className="font-semibold text-text-primary">{forecast.model} Forecast</h4>
        <ChevronDownIcon className="w-5 h-5 text-text-secondary group-open:rotate-180 transition-transform" />
      </summary>
      <div className="p-4 border-t border-border bg-black/20">
        <div className="max-h-60 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-secondary">
              <tr>
                <th className="p-2 font-medium text-text-secondary">Date</th>
                <th className="p-2 font-medium text-text-secondary text-right">Forecasted Price</th>
              </tr>
            </thead>
            <tbody>
              {forecast.data.map((d) => (
                <tr key={d.Date} className="border-b border-border last:border-b-0">
                  <td className="p-2 text-text-secondary">{formatDate(d.Date)}</td>
                  <td className="p-2 text-text-primary text-right font-mono">{formatCurrency(d.yhat, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
};

export const Forecasts: React.FC<ForecastsProps> = ({ forecasts, currency }) => {
  return (
    <div className="space-y-4">
      {forecasts.map(f => (
        <ForecastItem key={f.model} forecast={f} currency={currency} />
      ))}
    </div>
  );
};
