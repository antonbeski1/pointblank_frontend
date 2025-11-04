
export interface StockData {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  bb_upper?: number;
  bb_middle?: number;
  bb_lower?: number;
  rsi?: number;
  macd?: number;
  macd_signal?: number;
  macd_hist?: number;
}

export interface Analysis {
  overall: {
    score: number;
    signal: string;
  };
  price: {
    current: number;
    change: number;
    change_pct: number;
    trend: string;
  };
  moving_averages: {
    sma_20: number;
    sma_50: number;
    signal: string;
  };
  rsi: {
    value: number;
    signal: string;
  };
  macd: {
    macd: number;
    signal: number;
    trend: string;
  };
}

export interface Forecast {
  model: string;
  data: {
    Date: string;
    yhat: number;
  }[];
}

export interface NewsArticle {
  title: string;
  link: string;
  source: string;
  published: string;
  image?: string;
}

export interface FullStockInfo {
    ticker: string;
    companyName: string;
    currency: string;
    history: StockData[];
    analysis: Analysis;
    forecasts: Forecast[];
    news: NewsArticle[];
    deepAnalysis: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type ActiveIndicators = {
  bb: boolean;
  rsi: boolean;
  macd: boolean;
};
