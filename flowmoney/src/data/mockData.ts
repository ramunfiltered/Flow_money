import type { Account, Transaction, Budget } from '../types';

// ============================================================
// ACCOUNTS
// ============================================================
export const initialAccounts: Account[] = [
  // Bank / Savings
  { id: 'sbi',     name: 'SBI',                  type: 'savings',     balance: 42500,  color: '#2563eb' },
  { id: 'kotak',   name: 'Kotak',                type: 'savings',     balance: 18300,  color: '#7c3aed' },
  { id: 'indusind',name: 'IndusInd',             type: 'savings',     balance: 9750,   color: '#0891b2' },
  { id: 'federal', name: 'Federal',              type: 'savings',     balance: 6200,   color: '#059669' },
  { id: 'slicesb', name: 'Slice SB',             type: 'savings',     balance: 3400,   color: '#f59e0b' },
  { id: 'canara',  name: 'Canara Bank',          type: 'savings',     balance: 11800,  color: '#dc2626' },
  { id: 'bob',     name: 'Bank of Baroda',       type: 'savings',     balance: 5600,   color: '#ea580c' },
  // Credit Cards (balance = outstanding, positive = you owe)
  { id: 'slicecc', name: 'Slice CC',             type: 'credit_card', balance: 3200,   color: '#8b5cf6' },
  { id: 'supermoney', name: 'SuperMoney CC',     type: 'credit_card', balance: 1750,   color: '#06b6d4' },
];

// ============================================================
// TRANSACTIONS  (expenses, income, transfers)
// ============================================================
let txCounter = 1;
const txId = () => `tx-${String(txCounter++).padStart(4, '0')}`;

export const initialTransactions: Transaction[] = [
  // ── SEPTEMBER 2026 (prev month for comparisons) ──────────
  // Income
  { id: txId(), type: 'income',   amount: 55000, date: '2026-09-01', description: 'Monthly Salary',    accountId: 'sbi',       source: 'Salary' },
  { id: txId(), type: 'income',   amount: 8000,  date: '2026-09-10', description: 'Freelance project', accountId: 'kotak',     source: 'Freelancing' },
  // Expenses Sep
  { id: txId(), type: 'expense',  amount: 1200,  date: '2026-09-02', description: 'Grocery run',       accountId: 'sbi',       category: 'Food' },
  { id: txId(), type: 'expense',  amount: 450,   date: '2026-09-03', description: 'Swiggy dinner',     accountId: 'slicecc',   category: 'Food' },
  { id: txId(), type: 'expense',  amount: 280,   date: '2026-09-04', description: 'Auto ride',         accountId: 'slicesb',   category: 'Travel' },
  { id: txId(), type: 'expense',  amount: 3200,  date: '2026-09-05', description: 'H&M Shopping',      accountId: 'slicecc',   category: 'Shopping' },
  { id: txId(), type: 'expense',  amount: 1800,  date: '2026-09-06', description: 'Amazon order',      accountId: 'kotak',     category: 'Shopping' },
  { id: txId(), type: 'expense',  amount: 650,   date: '2026-09-07', description: 'Movie tickets',     accountId: 'slicecc',   category: 'Entertainment' },
  { id: txId(), type: 'expense',  amount: 900,   date: '2026-09-08', description: 'Electricity bill',  accountId: 'sbi',       category: 'Bills' },
  { id: txId(), type: 'expense',  amount: 500,   date: '2026-09-09', description: 'Udemy course',      accountId: 'slicecc',   category: 'Education' },
  { id: txId(), type: 'expense',  amount: 350,   date: '2026-09-10', description: 'Pharmacy',          accountId: 'sbi',       category: 'Health' },
  { id: txId(), type: 'expense',  amount: 180,   date: '2026-09-11', description: 'Zomato lunch',      accountId: 'slicesb',   category: 'Food' },
  { id: txId(), type: 'expense',  amount: 120,   date: '2026-09-12', description: 'Tea & snacks',      accountId: 'slicecc',   category: 'Food' },
  { id: txId(), type: 'expense',  amount: 1500,  date: '2026-09-13', description: 'Train ticket',      accountId: 'sbi',       category: 'Travel' },
  { id: txId(), type: 'expense',  amount: 250,   date: '2026-09-14', description: 'Petrol',            accountId: 'indusind',  category: 'Travel' },
  { id: txId(), type: 'expense',  amount: 2800,  date: '2026-09-15', description: 'Shoe purchase',     accountId: 'supermoney',category: 'Shopping' },
  { id: txId(), type: 'expense',  amount: 800,   date: '2026-09-16', description: 'Netflix & Spotify', accountId: 'supermoney',category: 'Entertainment' },
  { id: txId(), type: 'expense',  amount: 600,   date: '2026-09-17', description: 'Gym membership',   accountId: 'federal',   category: 'Health' },
  { id: txId(), type: 'expense',  amount: 400,   date: '2026-09-18', description: 'Dominos pizza',     accountId: 'slicecc',   category: 'Food' },
  { id: txId(), type: 'expense',  amount: 320,   date: '2026-09-19', description: 'Rapido cab',        accountId: 'slicesb',   category: 'Travel' },
  { id: txId(), type: 'expense',  amount: 1100,  date: '2026-09-20', description: 'Water bill + WiFi', accountId: 'sbi',       category: 'Bills' },
  { id: txId(), type: 'expense',  amount: 750,   date: '2026-09-21', description: 'Book purchase',     accountId: 'kotak',     category: 'Education' },
  { id: txId(), type: 'expense',  amount: 560,   date: '2026-09-22', description: 'Biryani dinner',    accountId: 'slicecc',   category: 'Food' },
  { id: txId(), type: 'expense',  amount: 200,   date: '2026-09-23', description: 'Bus pass',          accountId: 'sbi',       category: 'Travel' },
  { id: txId(), type: 'expense',  amount: 1900,  date: '2026-09-24', description: 'Myntra haul',       accountId: 'slicecc',   category: 'Shopping' },
  { id: txId(), type: 'expense',  amount: 450,   date: '2026-09-25', description: 'Doctor visit',      accountId: 'kotak',     category: 'Health' },
  { id: txId(), type: 'expense',  amount: 300,   date: '2026-09-26', description: 'Kirana store',      accountId: 'canara',    category: 'Food' },
  { id: txId(), type: 'expense',  amount: 880,   date: '2026-09-27', description: 'Weekend outing',    accountId: 'slicecc',   category: 'Entertainment' },
  { id: txId(), type: 'expense',  amount: 420,   date: '2026-09-28', description: 'Zepto groceries',   accountId: 'slicesb',   category: 'Food' },
  { id: txId(), type: 'expense',  amount: 500,   date: '2026-09-29', description: 'Gas cylinder',      accountId: 'bob',       category: 'Bills' },
  { id: txId(), type: 'expense',  amount: 260,   date: '2026-09-30', description: 'Parking',           accountId: 'indusind',  category: 'Travel' },
  // Transfer Sep
  { id: txId(), type: 'transfer', amount: 5000,  date: '2026-09-05', description: 'Slice CC bill pay', accountId: 'sbi',       toAccountId: 'slicecc' },
  { id: txId(), type: 'transfer', amount: 2000,  date: '2026-09-20', description: 'Top-up Slice SB',   accountId: 'kotak',     toAccountId: 'slicesb' },

  // ── OCTOBER 2026 (current month) ─────────────────────────
  // Income
  { id: txId(), type: 'income',   amount: 55000, date: '2026-10-01', description: 'Monthly Salary',    accountId: 'sbi',       source: 'Salary' },
  { id: txId(), type: 'income',   amount: 3500,  date: '2026-10-06', description: 'Freelance logo job', accountId: 'kotak',    source: 'Freelancing' },
  { id: txId(), type: 'income',   amount: 500,   date: '2026-10-07', description: 'Cashback refund',    accountId: 'slicesb',  source: 'Refund' },
  // Expenses Oct
  { id: txId(), type: 'expense',  amount: 1350,  date: '2026-10-01', description: 'Monthly groceries', accountId: 'sbi',       category: 'Food' },
  { id: txId(), type: 'expense',  amount: 480,   date: '2026-10-02', description: 'Swiggy orders',     accountId: 'slicecc',   category: 'Food' },
  { id: txId(), type: 'expense',  amount: 150,   date: '2026-10-02', description: 'Metro recharge',    accountId: 'slicesb',   category: 'Travel' },
  { id: txId(), type: 'expense',  amount: 940,   date: '2026-10-03', description: 'Electricity bill',  accountId: 'sbi',       category: 'Bills' },
  { id: txId(), type: 'expense',  amount: 2400,  date: '2026-10-03', description: 'Flipkart sale haul',accountId: 'slicecc',   category: 'Shopping' },
  { id: txId(), type: 'expense',  amount: 340,   date: '2026-10-04', description: 'Auto & cab rides',  accountId: 'slicesb',   category: 'Travel' },
  { id: txId(), type: 'expense',  amount: 200,   date: '2026-10-04', description: 'Tea stall & snacks',accountId: 'canara',    category: 'Food' },
  { id: txId(), type: 'expense',  amount: 599,   date: '2026-10-05', description: 'OTT subscriptions', accountId: 'supermoney',category: 'Entertainment' },
  { id: txId(), type: 'expense',  amount: 1800,  date: '2026-10-05', description: 'Weekend trip fuel', accountId: 'indusind',  category: 'Travel' },
  { id: txId(), type: 'expense',  amount: 750,   date: '2026-10-06', description: 'Dining out',        accountId: 'supermoney',category: 'Food' },
  { id: txId(), type: 'expense',  amount: 650,   date: '2026-10-06', description: 'Coursera course',   accountId: 'kotak',     category: 'Education' },
  { id: txId(), type: 'expense',  amount: 420,   date: '2026-10-07', description: 'Pharmacy & meds',   accountId: 'sbi',       category: 'Health' },
  { id: txId(), type: 'expense',  amount: 320,   date: '2026-10-07', description: 'Kirana groceries',  accountId: 'sbi',       category: 'Food' },
  { id: txId(), type: 'expense',  amount: 180,   date: '2026-10-08', description: 'Zomato breakfast',  accountId: 'slicecc',   category: 'Food' },
  // Transfer Oct
  { id: txId(), type: 'transfer', amount: 3200,  date: '2026-10-04', description: 'Slice CC payment',  accountId: 'sbi',       toAccountId: 'slicecc' },
  { id: txId(), type: 'transfer', amount: 1000,  date: '2026-10-07', description: 'Top-up Slice SB',   accountId: 'kotak',     toAccountId: 'slicesb' },
];

// ============================================================
// BUDGETS
// ============================================================
export const initialBudgets: Budget[] = [
  { id: 'b-2026-08', month: 8,  year: 2026, amount: 20000 },
  { id: 'b-2026-09', month: 9,  year: 2026, amount: 22000 },
  { id: 'b-2026-10', month: 10, year: 2026, amount: 20000 },
  { id: 'b-2026-11', month: 11, year: 2026, amount: 18000 },
  { id: 'b-2026-12', month: 12, year: 2026, amount: 25000 },
];
