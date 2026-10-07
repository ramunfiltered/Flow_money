import type { CategoryConfig } from '../types';

export const CATEGORY_CONFIG: CategoryConfig[] = [
  { name: 'Food',          color: '#f97316', icon: '🍽️' },
  { name: 'Travel',        color: '#3b82f6', icon: '🚗' },
  { name: 'Shopping',      color: '#a855f7', icon: '🛍️' },
  { name: 'Education',     color: '#10b981', icon: '📚' },
  { name: 'Bills',         color: '#ef4444', icon: '📋' },
  { name: 'Entertainment', color: '#f59e0b', icon: '🎬' },
  { name: 'Health',        color: '#06b6d4', icon: '💊' },
  { name: 'Other',         color: '#6b7280', icon: '📦' },
];

export const INCOME_SOURCES = [
  'Salary',
  'Freelancing',
  'Allowance',
  'Refund',
  'Interest',
  'Other',
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const formatCurrency = (amount: number, currency = '₹'): string => {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.abs(amount));
  return `${currency}${formatted}`;
};

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatShortDate = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export const getCategoryColor = (category: string): string => {
  return CATEGORY_CONFIG.find(c => c.name === category)?.color ?? '#6b7280';
};

export const getCategoryIcon = (category: string): string => {
  return CATEGORY_CONFIG.find(c => c.name === category)?.icon ?? '📦';
};

export const getMonthYear = (month: number, year: number): string => {
  return `${MONTHS[month - 1]} ${year}`;
};

export const isSameMonth = (dateStr: string, month: number, year: number): boolean => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getMonth() + 1 === month && d.getFullYear() === year;
};

export const generateId = (): string => {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};
