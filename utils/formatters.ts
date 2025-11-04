
export const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

export const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)}y ago`;
  
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)}mo ago`;

  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)}d ago`;

  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)}h ago`;

  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)}m ago`;

  return `${Math.floor(seconds)}s ago`;
};

export const getSignalColor = (signal: string) => {
  if (signal.toLowerCase().includes('buy')) return 'text-green-400';
  if (signal.toLowerCase().includes('sell')) return 'text-red-400';
  if (signal.toLowerCase().includes('hold') || signal.toLowerCase().includes('neutral')) return 'text-yellow-400';
  return 'text-text-secondary';
};

export const getSignalIcon = (signal: string) => {
  if (signal.toLowerCase().includes('buy')) return '▲';
  if (signal.toLowerCase().includes('sell')) return '▼';
  return '●';
};
