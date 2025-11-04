
import React, { useState, useRef, useEffect } from 'react';
import { continueChat } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { SendIcon, UserIcon, SparklesIcon } from './icons';

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hello! I'm your AI financial assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await continueChat([...messages, userMessage]);
      const modelMessage: ChatMessage = { role: 'model', content: response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-text-primary mb-4 p-4">AI Financial Chatbot</h2>
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>}
            <div className={`max-w-md p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-surface text-text-primary rounded-bl-none'}`}>
              <div className="prose prose-invert max-w-none text-white" dangerouslySetInnerHTML={{__html: msg.content}} />
            </div>
             {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5 text-text-primary" /></div>}
          </div>
        ))}
         {isLoading && (
          <div className="flex items-start gap-4">
             <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>
            <div className="p-4 rounded-2xl bg-surface rounded-bl-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-border">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about markets, trends, or financial concepts..."
            className="w-full bg-surface border border-border rounded-full py-3 pl-4 pr-12 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary hover:bg-blue-600 transition disabled:bg-secondary"
          >
            <SendIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
