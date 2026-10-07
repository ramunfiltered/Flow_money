import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Account, Transaction, Budget, AppState } from '../types';
import { initialAccounts, initialTransactions, initialBudgets } from '../data/mockData';
import { generateId } from '../data/constants';

// ── Action types ──────────────────────────────────────────────

type Action =
  | { type: 'ADD_TRANSACTION';    payload: Omit<Transaction, 'id'> }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'UPSERT_BUDGET';      payload: Budget }
  | { type: 'SET_MONTH';          payload: { month: number; year: number } }
  | { type: 'SET_THEME';          payload: 'light' | 'dark' }
  | { type: 'UPDATE_ACCOUNT';     payload: Account };

// ── Initial state ─────────────────────────────────────────────

const initialState: AppState = {
  accounts: initialAccounts,
  transactions: initialTransactions,
  budgets: initialBudgets,
  selectedMonth: 10,
  selectedYear: 2026,
  theme: 'dark',
  currency: '₹',
};

// ── Reducer ───────────────────────────────────────────────────

function applyTransactionToAccounts(accounts: Account[], tx: Transaction): Account[] {
  return accounts.map(acc => {
    if (tx.type === 'expense' && acc.id === tx.accountId) {
      if (acc.type === 'credit_card') {
        return { ...acc, balance: acc.balance + tx.amount }; // outstanding goes up
      }
      return { ...acc, balance: acc.balance - tx.amount };
    }
    if (tx.type === 'income' && acc.id === tx.accountId) {
      return { ...acc, balance: acc.balance + tx.amount };
    }
    if (tx.type === 'transfer') {
      if (acc.id === tx.accountId) {
        return { ...acc, balance: acc.balance - tx.amount }; // source loses balance
      }
      if (acc.id === tx.toAccountId) {
        if (acc.type === 'credit_card') {
          return { ...acc, balance: Math.max(0, acc.balance - tx.amount) }; // CC outstanding goes down
        }
        return { ...acc, balance: acc.balance + tx.amount };
      }
    }
    return acc;
  });
}

function reverseTransactionFromAccounts(accounts: Account[], tx: Transaction): Account[] {
  // Reverse = apply opposite direction
  return accounts.map(acc => {
    if (tx.type === 'expense' && acc.id === tx.accountId) {
      if (acc.type === 'credit_card') {
        return { ...acc, balance: acc.balance - tx.amount };
      }
      return { ...acc, balance: acc.balance + tx.amount };
    }
    if (tx.type === 'income' && acc.id === tx.accountId) {
      return { ...acc, balance: acc.balance - tx.amount };
    }
    if (tx.type === 'transfer') {
      if (acc.id === tx.accountId) {
        return { ...acc, balance: acc.balance + tx.amount };
      }
      if (acc.id === tx.toAccountId) {
        if (acc.type === 'credit_card') {
          return { ...acc, balance: acc.balance + tx.amount };
        }
        return { ...acc, balance: acc.balance - tx.amount };
      }
    }
    return acc;
  });
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TRANSACTION': {
      const tx: Transaction = { ...action.payload, id: generateId() };
      const newAccounts = applyTransactionToAccounts(state.accounts, tx);
      return { ...state, transactions: [tx, ...state.transactions], accounts: newAccounts };
    }

    case 'UPDATE_TRANSACTION': {
      const oldTx = state.transactions.find(t => t.id === action.payload.id);
      if (!oldTx) return state;
      // Reverse old, apply new
      let accounts = reverseTransactionFromAccounts(state.accounts, oldTx);
      accounts = applyTransactionToAccounts(accounts, action.payload);
      const transactions = state.transactions.map(t =>
        t.id === action.payload.id ? action.payload : t,
      );
      return { ...state, transactions, accounts };
    }

    case 'DELETE_TRANSACTION': {
      const tx = state.transactions.find(t => t.id === action.payload);
      if (!tx) return state;
      const accounts = reverseTransactionFromAccounts(state.accounts, tx);
      const transactions = state.transactions.filter(t => t.id !== action.payload);
      return { ...state, transactions, accounts };
    }

    case 'UPSERT_BUDGET': {
      const exists = state.budgets.find(
        b => b.month === action.payload.month && b.year === action.payload.year,
      );
      const budgets = exists
        ? state.budgets.map(b =>
            b.month === action.payload.month && b.year === action.payload.year
              ? action.payload
              : b,
          )
        : [...state.budgets, { ...action.payload, id: action.payload.id || generateId() }];
      return { ...state, budgets };
    }

    case 'SET_MONTH':
      return { ...state, selectedMonth: action.payload.month, selectedYear: action.payload.year };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'UPDATE_ACCOUNT': {
      const accounts = state.accounts.map(a =>
        a.id === action.payload.id ? action.payload : a,
      );
      return { ...state, accounts };
    }

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  addTransaction:    (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  upsertBudget:      (budget: Budget) => void;
  setMonth:          (month: number, year: number) => void;
  setTheme:          (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addTransaction    = useCallback((tx: Omit<Transaction, 'id'>) => dispatch({ type: 'ADD_TRANSACTION',    payload: tx }), []);
  const updateTransaction = useCallback((tx: Transaction)              => dispatch({ type: 'UPDATE_TRANSACTION', payload: tx }), []);
  const deleteTransaction = useCallback((id: string)                   => dispatch({ type: 'DELETE_TRANSACTION', payload: id }), []);
  const upsertBudget      = useCallback((budget: Budget)               => dispatch({ type: 'UPSERT_BUDGET',      payload: budget }), []);
  const setMonth          = useCallback((month: number, year: number)  => dispatch({ type: 'SET_MONTH',          payload: { month, year } }), []);
  const setTheme          = useCallback((theme: 'light' | 'dark')     => dispatch({ type: 'SET_THEME',          payload: theme }), []);

  return (
    <AppContext.Provider value={{ state, addTransaction, updateTransaction, deleteTransaction, upsertBudget, setMonth, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
