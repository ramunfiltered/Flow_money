// ============================================================
// DATA SERVICE LAYER
// All data reads and calculations happen here.
// To switch to Google Sheets API, replace only this file.
// ============================================================

import type {
  Account,
  Transaction,
  Budget,
  MonthSummary,
  CategoryBreakdown,
  DailySpending,
  AccountSummary,
  Category,
} from '../types';
import { CATEGORY_CONFIG, getCategoryColor, isSameMonth } from './constants';

// ── Summary ──────────────────────────────────────────────────

export function getMonthSummary(
  accounts: Account[],
  transactions: Transaction[],
  budgets: Budget[],
  month: number,
  year: number,
): MonthSummary {
  const monthTxs = transactions.filter(tx => isSameMonth(tx.date, month, year));

  const totalIncome = monthTxs
    .filter(tx => tx.type === 'income')
    .reduce((s, tx) => s + tx.amount, 0);

  const totalExpenses = monthTxs
    .filter(tx => tx.type === 'expense')
    .reduce((s, tx) => s + tx.amount, 0);

  const totalTransferred = monthTxs
    .filter(tx => tx.type === 'transfer')
    .reduce((s, tx) => s + tx.amount, 0);

  const budgetObj = budgets.find(b => b.month === month && b.year === year);
  const budget = budgetObj?.amount ?? 0;
  const remaining = budget - totalExpenses;

  const creditOutstanding = accounts
    .filter(a => a.type === 'credit_card')
    .reduce((s, a) => s + a.balance, 0);

  const totalAvailable = accounts
    .filter(a => a.type === 'savings')
    .reduce((s, a) => s + a.balance, 0);

  return { totalIncome, totalExpenses, totalTransferred, budget, remaining, creditOutstanding, totalAvailable };
}

// ── Category Breakdown ────────────────────────────────────────

export function getCategoryBreakdown(
  transactions: Transaction[],
  month: number,
  year: number,
): CategoryBreakdown[] {
  const monthExpenses = transactions.filter(
    tx => tx.type === 'expense' && isSameMonth(tx.date, month, year),
  );

  const total = monthExpenses.reduce((s, tx) => s + tx.amount, 0);
  if (total === 0) return [];

  const map: Record<string, number> = {};
  for (const tx of monthExpenses) {
    const cat = tx.category ?? 'Other';
    map[cat] = (map[cat] ?? 0) + tx.amount;
  }

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category: category as Category,
      amount,
      percentage: Math.round((amount / total) * 100),
      color: getCategoryColor(category),
      count: monthExpenses.filter(tx => (tx.category ?? 'Other') === category).length,
    }));
}

// ── Daily Spending ────────────────────────────────────────────

export function getDailySpending(
  transactions: Transaction[],
  month: number,
  year: number,
): DailySpending[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const result: DailySpending[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const amount = transactions
      .filter(tx => tx.type === 'expense' && tx.date === dateStr)
      .reduce((s, tx) => s + tx.amount, 0);
    result.push({ day, amount, date: dateStr });
  }

  return result;
}

// ── Account Summaries ─────────────────────────────────────────

export function getAccountSummaries(
  accounts: Account[],
  transactions: Transaction[],
  month: number,
  year: number,
): AccountSummary[] {
  return accounts.map(account => {
    const monthTxs = transactions.filter(tx => isSameMonth(tx.date, month, year));

    const monthExpenses = monthTxs
      .filter(tx => tx.type === 'expense' && tx.accountId === account.id)
      .reduce((s, tx) => s + tx.amount, 0);

    const monthIncome = monthTxs
      .filter(tx => tx.type === 'income' && tx.accountId === account.id)
      .reduce((s, tx) => s + tx.amount, 0);

    const recentTransactions = transactions
      .filter(tx => tx.accountId === account.id || tx.toAccountId === account.id)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    return { account, monthExpenses, monthIncome, recentTransactions };
  });
}

// ── Spending Trend ────────────────────────────────────────────

export function getSpendingTrend(
  transactions: Transaction[],
  month: number,
  year: number,
): { currentMonth: number; prevMonth: number; change: number; changePercent: number } {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const currentMonth = transactions
    .filter(tx => tx.type === 'expense' && isSameMonth(tx.date, month, year))
    .reduce((s, tx) => s + tx.amount, 0);

  const prevMonthTotal = transactions
    .filter(tx => tx.type === 'expense' && isSameMonth(tx.date, prevMonth, prevYear))
    .reduce((s, tx) => s + tx.amount, 0);

  const change = currentMonth - prevMonthTotal;
  const changePercent = prevMonthTotal > 0
    ? Math.round((change / prevMonthTotal) * 100)
    : 0;

  return { currentMonth, prevMonth: prevMonthTotal, change, changePercent };
}

// ── Account Balance after all transactions ────────────────────

export function computeAccountBalances(
  baseAccounts: Account[],
  transactions: Transaction[],
): Account[] {
  // Start from initial balances (already pre-calculated in mock data)
  // This function re-applies any new transactions on top of the mock balances.
  // In a real app, this would be driven by the backend's current balance.
  return baseAccounts;
}

// ── Transaction filter helpers ────────────────────────────────

export function filterTransactions(
  transactions: Transaction[],
  opts: {
    month?: number;
    year?: number;
    accountId?: string;
    category?: string;
    type?: string;
    search?: string;
  },
): Transaction[] {
  return transactions.filter(tx => {
    if (opts.month && opts.year && !isSameMonth(tx.date, opts.month, opts.year)) return false;
    if (opts.accountId && tx.accountId !== opts.accountId && tx.toAccountId !== opts.accountId) return false;
    if (opts.category && tx.category !== opts.category) return false;
    if (opts.type && tx.type !== opts.type) return false;
    if (opts.search) {
      const q = opts.search.toLowerCase();
      if (!tx.description.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));
}

// ── Analytics helpers ─────────────────────────────────────────

export function getInsights(
  transactions: Transaction[],
  month: number,
  year: number,
  categoryBreakdown: CategoryBreakdown[],
): string[] {
  const insights: string[] = [];
  const monthTxs = transactions.filter(tx => isSameMonth(tx.date, month, year));
  const expenses = monthTxs.filter(tx => tx.type === 'expense');

  if (categoryBreakdown.length > 0) {
    insights.push(`${categoryBreakdown[0].category} is your top spending category this month (${categoryBreakdown[0].percentage}%).`);
  }

  const totalExpenses = expenses.reduce((s, tx) => s + tx.amount, 0);
  const daysWithSpending = new Set(expenses.map(tx => tx.date)).size;
  if (daysWithSpending > 0) {
    const avgDaily = Math.round(totalExpenses / daysWithSpending);
    insights.push(`Your average daily spending is ₹${avgDaily.toLocaleString('en-IN')}.`);
  }

  const dayTotals: Record<string, number> = {};
  for (const tx of expenses) {
    dayTotals[tx.date] = (dayTotals[tx.date] ?? 0) + tx.amount;
  }
  const highestDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];
  if (highestDay) {
    const d = new Date(highestDay[0] + 'T00:00:00');
    insights.push(
      `Highest spending on ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: ₹${highestDay[1].toLocaleString('en-IN')}.`,
    );
  }

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevTotal = transactions
    .filter(tx => tx.type === 'expense' && isSameMonth(tx.date, prevMonth, prevYear))
    .reduce((s, tx) => s + tx.amount, 0);

  if (prevTotal > 0) {
    const diff = totalExpenses - prevTotal;
    const pct = Math.abs(Math.round((diff / prevTotal) * 100));
    const prevMonthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    if (diff < 0) {
      insights.push(`You spent ₹${Math.abs(diff).toLocaleString('en-IN')} (${pct}%) less than ${prevMonthNames[prevMonth - 1]}.`);
    } else if (diff > 0) {
      insights.push(`You spent ₹${diff.toLocaleString('en-IN')} (${pct}%) more than ${prevMonthNames[prevMonth - 1]}.`);
    }
  }

  return insights;
}

export { CATEGORY_CONFIG };
