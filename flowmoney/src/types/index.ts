// ============================================================
// CORE DATA TYPES
// These types define the data model for FlowMoney.
// The data layer is designed to be swapped out for a Google
// Sheets API without changing the UI components.
// ============================================================

export type AccountType = 'savings' | 'credit_card';

export type TransactionType = 'expense' | 'income' | 'transfer';

export type Category =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Education'
  | 'Bills'
  | 'Entertainment'
  | 'Health'
  | 'Other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number; // For savings: current balance. For CC: outstanding (positive = you owe)
  color: string;   // Accent color for UI
  icon?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO date string YYYY-MM-DD
  description: string;
  category?: Category;         // For expenses
  accountId: string;           // Source account
  toAccountId?: string;        // Destination account (transfers only)
  source?: string;             // For income: source label
}

export interface Budget {
  id: string;
  month: number; // 1-12
  year: number;
  amount: number;
}

export interface CategoryConfig {
  name: Category;
  color: string;
  icon: string;
}

// ============================================================
// APP STATE (what the store manages)
// ============================================================

export interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  selectedMonth: number;  // 1-12
  selectedYear: number;
  theme: 'light' | 'dark';
  currency: string;
}

// ============================================================
// COMPUTED / DERIVED TYPES (returned from service layer)
// ============================================================

export interface MonthSummary {
  totalIncome: number;
  totalExpenses: number;
  totalTransferred: number;
  budget: number;
  remaining: number;
  creditOutstanding: number;
  totalAvailable: number;
}

export interface CategoryBreakdown {
  category: Category;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface DailySpending {
  day: number;
  amount: number;
  date: string;
}

export interface AccountSummary {
  account: Account;
  monthExpenses: number;
  monthIncome: number;
  recentTransactions: Transaction[];
}
