import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { CATEGORY_CONFIG, INCOME_SOURCES } from '../../data/constants';
import type { Transaction, Category } from '../../types';

type TxType = 'expense' | 'income' | 'transfer';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTx?: Transaction;
  defaultType?: TxType;
}

const today = new Date().toISOString().split('T')[0];

const emptyForm = (type: TxType = 'expense') => ({
  type,
  amount: '',
  description: '',
  date: today,
  category: 'Food' as Category,
  accountId: 'sbi',
  toAccountId: 'kotak',
  source: 'Salary',
});

export function TransactionForm({ isOpen, onClose, editTx, defaultType = 'expense' }: TransactionFormProps) {
  const { state, addTransaction, updateTransaction } = useApp();
  const { show } = useToast();

  const [form, setForm] = useState(() =>
    editTx
      ? {
          type: editTx.type as TxType,
          amount: String(editTx.amount),
          description: editTx.description,
          date: editTx.date,
          category: (editTx.category ?? 'Food') as Category,
          accountId: editTx.accountId,
          toAccountId: editTx.toAccountId ?? 'kotak',
          source: editTx.source ?? 'Salary',
        }
      : emptyForm(defaultType),
  );

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { show('Enter a valid amount', 'error'); return; }
    if (!form.description.trim()) { show('Enter a description', 'error'); return; }
    if (form.type === 'transfer' && form.accountId === form.toAccountId) {
      show('Source and destination must be different', 'error'); return;
    }

    const tx: Omit<Transaction, 'id'> = {
      type: form.type,
      amount,
      description: form.description.trim(),
      date: form.date,
      accountId: form.accountId,
      ...(form.type === 'expense' ? { category: form.category } : {}),
      ...(form.type === 'income' ? { source: form.source } : {}),
      ...(form.type === 'transfer' ? { toAccountId: form.toAccountId } : {}),
    };

    if (editTx) {
      updateTransaction({ ...tx, id: editTx.id });
      show('Transaction updated');
    } else {
      addTransaction(tx);
      show(form.type === 'expense' ? 'Expense added' : form.type === 'income' ? 'Income added' : 'Transfer recorded');
    }
    onClose();
    setForm(emptyForm(defaultType));
  };

  const tabs: TxType[] = ['expense', 'income', 'transfer'];
  const allAccounts = state.accounts;
  const savingsAccounts = allAccounts.filter(a => a.type === 'savings');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTx ? 'Edit Transaction' : 'Add Transaction'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} id="save-transaction-btn">
            {editTx ? 'Update' : 'Save'}
          </button>
        </>
      }
    >
      {/* Type tabs */}
      {!editTx && (
        <div style={{
          display: 'flex',
          background: 'var(--bg-elevated)',
          borderRadius: 10,
          padding: 4,
          marginBottom: '1.25rem',
        }}>
          {tabs.map(t => (
            <button
              key={t}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 7,
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s',
                background: form.type === t ? 'var(--bg-card)' : 'transparent',
                color: form.type === t
                  ? t === 'expense' ? 'var(--danger)'
                  : t === 'income' ? 'var(--success)'
                  : 'var(--accent)'
                  : 'var(--text-muted)',
                boxShadow: form.type === t ? 'var(--shadow-sm)' : 'none',
              }}
              onClick={() => set('type', t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Amount */}
        <div>
          <label className="label">Amount (₹)</label>
          <input
            id="tx-amount"
            className="input"
            type="number"
            min="0"
            placeholder="0.00"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            style={{ fontSize: '1.25rem', fontWeight: 600 }}
          />
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <input
            id="tx-description"
            className="input"
            placeholder={form.type === 'expense' ? 'e.g. Swiggy lunch' : form.type === 'income' ? 'e.g. Monthly salary' : 'e.g. Transfer to Kotak'}
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </div>

        {/* Date */}
        <div>
          <label className="label">Date</label>
          <input
            id="tx-date"
            className="input"
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
          />
        </div>

        {/* Category (expense only) */}
        {form.type === 'expense' && (
          <div>
            <label className="label">Category</label>
            <select id="tx-category" className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORY_CONFIG.map(c => (
                <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Source (income only) */}
        {form.type === 'income' && (
          <div>
            <label className="label">Source</label>
            <select id="tx-source" className="input" value={form.source} onChange={e => set('source', e.target.value)}>
              {INCOME_SOURCES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* Account */}
        <div>
          <label className="label">{form.type === 'transfer' ? 'From Account' : 'Account'}</label>
          <select id="tx-account" className="input" value={form.accountId} onChange={e => set('accountId', e.target.value)}>
            {(form.type === 'expense' ? allAccounts : form.type === 'transfer' ? allAccounts : allAccounts).map(a => (
              <option key={a.id} value={a.id}>{a.name} {a.type === 'credit_card' ? '(CC)' : ''}</option>
            ))}
          </select>
        </div>

        {/* To Account (transfer only) */}
        {form.type === 'transfer' && (
          <div>
            <label className="label">To Account</label>
            <select id="tx-to-account" className="input" value={form.toAccountId} onChange={e => set('toAccountId', e.target.value)}>
              {allAccounts.filter(a => a.id !== form.accountId).map(a => (
                <option key={a.id} value={a.id}>{a.name} {a.type === 'credit_card' ? '(CC)' : ''}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </Modal>
  );
}
