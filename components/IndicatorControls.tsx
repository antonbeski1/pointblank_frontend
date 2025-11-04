
import React from 'react';
import type { ActiveIndicators } from '../types';

type Indicator = keyof ActiveIndicators;

interface IndicatorControlsProps {
    activeIndicators: ActiveIndicators;
    setActiveIndicators: React.Dispatch<React.SetStateAction<ActiveIndicators>>;
}

const IndicatorButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            isActive
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-secondary text-text-secondary'
        }`}
    >
        {label}
    </button>
);

export const IndicatorControls: React.FC<IndicatorControlsProps> = ({ activeIndicators, setActiveIndicators }) => {
    const toggleIndicator = (indicator: Indicator) => {
        setActiveIndicators(prev => ({ ...prev, [indicator]: !prev[indicator] }));
    };

    return (
        <div className="flex items-center gap-2 bg-black/50 p-1 rounded-lg border border-border">
            <IndicatorButton label="Bollinger Bands" isActive={activeIndicators.bb} onClick={() => toggleIndicator('bb')} />
            <IndicatorButton label="RSI" isActive={activeIndicators.rsi} onClick={() => toggleIndicator('rsi')} />
            <IndicatorButton label="MACD" isActive={activeIndicators.macd} onClick={() => toggleIndicator('macd')} />
        </div>
    );
};
