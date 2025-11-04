
import { GoogleGenAI, Type, Content } from '@google/genai';
import type { StockData, Analysis, Forecast, NewsArticle, FullStockInfo, ChatMessage } from '../types';
import { marked } from 'marked';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper to parse Gemini JSON output safely
const parseJson = <T,>(text: string): T => {
  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as T;
  } catch (e) {
    console.error("Failed to parse JSON:", text);
    throw new Error("Received invalid JSON format from AI model.");
  }
};

export async function fetchStockDataAndAnalysis(ticker: string): Promise<Pick<FullStockInfo, 'ticker' | 'companyName' | 'currency' | 'history' | 'analysis'>> {
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      ticker: { type: Type.STRING },
      companyName: { type: Type.STRING },
      currency: { type: Type.STRING },
      history: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            Date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
            Open: { type: Type.NUMBER },
            High: { type: Type.NUMBER },
            Low: { type: Type.NUMBER },
            Close: { type: Type.NUMBER },
            Volume: { type: Type.INTEGER },
            bb_upper: { type: Type.NUMBER },
            bb_middle: { type: Type.NUMBER },
            bb_lower: { type: Type.NUMBER },
            rsi: { type: Type.NUMBER },
            macd: { type: Type.NUMBER },
            macd_signal: { type: Type.NUMBER },
            macd_hist: { type: Type.NUMBER },
          },
        },
      },
      analysis: {
        type: Type.OBJECT,
        properties: {
          overall: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, signal: { type: Type.STRING } } },
          price: { type: Type.OBJECT, properties: { current: { type: Type.NUMBER }, change: { type: Type.NUMBER }, change_pct: { type: Type.NUMBER }, trend: { type: Type.STRING } } },
          moving_averages: { type: Type.OBJECT, properties: { sma_20: { type: Type.NUMBER }, sma_50: { type: Type.NUMBER }, signal: { type: Type.STRING } } },
          rsi: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER }, signal: { type: Type.STRING } } },
          macd: { type: Type.OBJECT, properties: { macd: { type: Type.NUMBER }, signal: { type: Type.NUMBER }, trend: { type: Type.STRING } } },
        },
      },
    },
  };

  const prompt = `
  Generate a comprehensive stock analysis for the ticker "${ticker}".
  Provide the output in a single JSON object.
  - The history should contain plausible daily OHLCV data for the past 90 days.
  - For each historical data point, also calculate the following technical indicators:
    - Bollinger Bands (20-period SMA, 2 standard deviations). Name the fields: bb_upper, bb_middle, bb_lower.
    - RSI (14-period). Name the field: rsi.
    - MACD (12-period EMA, 26-period EMA, 9-period signal EMA). Name the fields: macd, macd_signal, macd_hist.
  - The technical analysis summary should be based on this generated historical data.
  - Determine a likely currency for the ticker (e.g., AAPL is USD, RELIANCE.NS is INR).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
    }
  });

  const data = parseJson<Omit<FullStockInfo, 'forecasts' | 'news' | 'deepAnalysis'>>(response.text);
  
  // Validate and sort history
  if (!data.history || !Array.isArray(data.history)) {
    throw new Error("AI model did not return valid historical data.");
  }
  data.history.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

  return data;
}

export async function generateForecasts(ticker: string, history: StockData[]): Promise<Forecast[]> {
    if (!history || history.length === 0) {
        // Cannot generate forecasts without historical data
        return [
            { model: 'Prophet', data: [] },
            { model: 'ARIMA', data: [] }
        ];
    }
  const lastClose = history[history.length - 1].Close;
  const lastDate = history[history.length - 1].Date;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      Prophet: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { Date: { type: Type.STRING }, yhat: { type: Type.NUMBER } } } },
      ARIMA: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { Date: { type: Type.STRING }, yhat: { type: Type.NUMBER } } } },
    }
  };

  const prompt = `
  Based on the ticker "${ticker}" with its last closing price at ${lastClose} on ${lastDate}, generate plausible 'Prophet' and 'ARIMA' model forecasts for the next 30 days.
  The forecast should start from the day after ${lastDate}.
  The values for 'yhat' should show some realistic daily volatility and trend.
  Return the response as a single JSON object with keys "Prophet" and "ARIMA". Each key should have an array of 30 forecast objects.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema
    }
  });
  
  const data = parseJson<{ Prophet: { Date: string, yhat: number }[], ARIMA: { Date: string, yhat: number }[] }>(response.text);

  return [
    { model: 'Prophet', data: data.Prophet },
    { model: 'ARIMA', data: data.ARIMA }
  ];
}


export async function fetchNews(ticker: string): Promise<NewsArticle[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Fetch the top 5 latest news articles for the stock ticker "${ticker}". For each article, provide the title, a direct link to the article, the source name, and the publication date. Do NOT summarize.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!groundingChunks) return [];

  return groundingChunks.map((chunk: any) => ({
    title: chunk.web?.title || 'No Title Available',
    link: chunk.web?.uri || '#',
    source: new URL(chunk.web?.uri || 'https://example.com').hostname,
    published: new Date().toISOString(), // Gemini search grounding doesn't provide dates, so we use current time.
    image: `https://logo.clearbit.com/${new URL(chunk.web?.uri || 'https://example.com').hostname}`
  })).slice(0, 8); // Limit to 8 articles
}

export async function generateDeepAnalysis(ticker: string): Promise<string> {
    const prompt = `Act as a senior financial analyst. Provide a deep, comprehensive analysis for the stock ticker "${ticker}". Cover the following aspects in detail with a professional tone:
    1.  **Company Overview:** What does the company do? What are its main products/services?
    2.  **Recent Performance:** Discuss its stock performance over the last quarter.
    3.  **Strengths & Weaknesses:** What are the key internal strengths and weaknesses?
    4.  **Opportunities & Threats:** What are the external opportunities and threats (market trends, competition)?
    5.  **Outlook:** What is the general outlook for the stock in the near to medium term?

    Use Markdown for formatting, including bolding for key terms and bullet points for lists.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
            tools: [{ googleSearch: {} }]
        },
    });

    return marked(response.text) as string;
}

export async function analyzeImage(base64Data: string, prompt: string): Promise<string> {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data,
        },
    };
    const textPart = {
        text: prompt,
    };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });

    return marked(response.text) as string;
}

// Fix: Refactored to correctly handle conversation history for a stateful chat experience.
export async function continueChat(history: ChatMessage[]): Promise<string> {
    const chatHistory = history.slice(0, -1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
    })) as Content[];

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: chatHistory,
        config: {
            systemInstruction: "You are a helpful and friendly financial AI assistant named Point.Blank. You provide clear, concise, and accurate information about financial markets, stock analysis, and economic concepts. Do not provide financial advice. Format your responses using Markdown."
        },
    });

    const lastMessage = history[history.length - 1];

    const response = await chat.sendMessage({ message: lastMessage.content });
    
    return marked(response.text) as string;
}
