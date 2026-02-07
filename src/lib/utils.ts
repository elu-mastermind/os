import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export * from './agentRegistry';
export * from './agentFactory';

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    idle: 'bg-gray-500',
    working: 'bg-blue-500',
    paused: 'bg-yellow-500',
    error: 'bg-red-500',
    active: 'bg-green-500',
    draft: 'bg-gray-400',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
    pending: 'bg-gray-400',
    in_progress: 'bg-blue-500',
    waiting_approval: 'bg-yellow-500',
  };
  return colors[status] || 'bg-gray-500';
}

export function getLevelBadgeColor(level: string): string {
  const colors: Record<string, string> = {
    executive: 'bg-purple-100 text-purple-800',
    director: 'bg-blue-100 text-blue-800',
    specialist: 'bg-green-100 text-green-800',
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
