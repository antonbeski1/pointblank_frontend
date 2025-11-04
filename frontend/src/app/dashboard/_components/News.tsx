import React from 'react';
import type { NewsArticle } from '@/types';
import { timeAgo } from '@/utils/formatters';

interface NewsProps {
  articles: NewsArticle[];
}

const NewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <a
    href={article.link}
    target="_blank"
    rel="noopener noreferrer"
    className="block bg-surface p-4 rounded-lg border border-border hover:bg-secondary transition-colors group"
  >
    <div className="flex gap-4">
      {article.image && (
        <img src={article.image} alt="" className="w-24 h-16 object-cover rounded-md flex-shrink-0 bg-secondary" />
      )}
      <div className="flex-grow">
        <h4 className="font-semibold text-text-primary group-hover:text-primary transition-colors leading-snug">{article.title}</h4>
        <div className="text-xs text-text-secondary mt-2 flex justify-between">
          <span>{article.source}</span>
          <span>{timeAgo(article.published)}</span>
        </div>
      </div>
    </div>
  </a>
);

export const News: React.FC<NewsProps> = ({ articles }) => {
  if (!articles || !articles.length) {
    return <div className="bg-surface rounded-lg p-4 h-full flex items-center justify-center text-text-secondary border border-border">No recent news found.</div>
  }
  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {articles.map((article, index) => (
        <NewsCard key={`${article.link}-${index}`} article={article} />
      ))}
    </div>
  );
};
