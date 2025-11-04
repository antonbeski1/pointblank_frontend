'use client';
import React, { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { ImageIcon, UploadIcon, XIcon } from '@/components/icons';

interface UploadedImage {
    base64: string;
    mimeType: string;
}

export const ImageAnalyzer: React.FC = () => {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('What does this financial chart indicate?');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        setImage({
            base64: result.split(',')[1],
            mimeType: file.type
        });
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearImage = () => {
      setImage(null);
      setPreview(null);
  }

  const handleAnalyze = useCallback(async () => {
    if (!image) {
      setError('Please upload an image first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const response = await api.post('/api/analyze-image/', {
          image: image.base64,
          mimeType: image.mimeType,
          prompt: prompt
      });
      setAnalysis(response.data.analysis);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || 'Failed to analyze image.');
    } finally {
      setIsLoading(false);
    }
  }, [image, prompt]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-text-primary mb-4 flex items-center gap-2"><ImageIcon /> Image Analyzer</h2>
      <p className="text-text-secondary mb-6">Upload an image of a financial document, chart, or report, and ask Gemini to analyze it.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="rounded-lg w-full h-auto object-contain max-h-96 border border-border" />
              <button onClick={clearImage} className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 hover:bg-black">
                <XIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          ) : (
            <div className="w-full h-64 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center bg-surface">
              <label htmlFor="image-upload" className="cursor-pointer text-center">
                <UploadIcon className="w-10 h-10 text-text-secondary mx-auto mb-2" />
                <span className="text-primary font-semibold">Click to upload</span>
                <p className="text-xs text-text-secondary">PNG, JPG, or WEBP</p>
              </label>
              <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          )}
          <div className="mt-4">
            <label htmlFor="prompt" className="text-sm font-medium text-text-secondary block mb-1">Your Question</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!image || isLoading}
            className="mt-4 w-full bg-primary text-white font-semibold rounded-lg px-4 py-2 flex items-center justify-center hover:bg-blue-600 transition disabled:bg-secondary disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : 'Analyze with Gemini'}
          </button>
        </div>

        <div className="bg-surface rounded-lg p-4 border border-border">
          <h3 className="font-semibold text-text-primary mb-2">Gemini's Analysis</h3>
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {error && <p className="text-red-400">{error}</p>}
          {analysis && <div className="prose prose-invert max-w-none text-text-primary" dangerouslySetInnerHTML={{ __html: analysis }} />}
          {!analysis && !isLoading && !error && <p className="text-text-secondary">Analysis will appear here.</p>}
        </div>
      </div>
    </div>
  );
};
