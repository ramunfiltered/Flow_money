import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MonthSelector } from '../components/ui/MonthSelector';
import { TransactionRow } from '../components/ui/TransactionRow';
import { TransactionForm } from '../components/forms/TransactionForm';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { filterTransactions, getCategoryBreakdown } from '../data/dataService';
import { formatCurrency, CATEGORY_CONFIG } from '../data/constants';
import type { Transaction } from '../types';

export function Expenses() {
  const { state, setMonth, deleteTransaction } = useApp();
  const { accounts, transactions, selectedMonth, selectedYear } = state;
  const { show } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | undefined>();
  const [deleteTx, setDeleteTx] = useState<Transaction | undefined>();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const filtered = useMemo(() =>
    filterTransactions(transactions, {
      month: selectedMonth, year: selectedYear,
      type: 'expense',
      category: filterCat || undefined,
      search: search || undefined,
    }),
    [transactions, selectedMonth, selectedYear, filterCat, search],
  );

  const catBreak = useMemo(() => getCategoryBreakdown(transactions, selectedMonth, selectedYear), [transactions, selectedMonth, selectedYear]);
  const total = filtered.reduce((s, tx) => s + tx.amount, 0);

  const handleEdit = (tx: Transaction) => { setEditTx(tx); setShowForm(true); };
  const handleDelete = (tx: Transaction) => setDeleteTx(tx);
  const confirmDelete = () => {
    if (!deleteTx) return;
    deleteTransaction(deleteTx.id);
    show('Transaction deleted', 'info');
    setDeleteTx(undefined);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            Expenses
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
            {filtered.length} transactions · {formatCurrency(total)}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <MonthSelector month={selectedMonth} year={selectedYear} onChange={setMonth} />
          <button
            id="add-expense-btn"
            className="btn btn-primary"
            onClick={() => { setEditTx(undefined); setShowForm(true); }}
          >
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Category summary chips */}
      {catBreak.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`badge ${!filterCat ? '' : ''}`}
            onClick={() => setFilterCat('')}
            style={{
              background: !filterCat ? 'var(--accent)' : 'var(--bg-elevated)',
              color: !filterCat ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer', border: 'none',
            }}
          >
            All
          </button>
          {catBreak.map(cat => (
            <button
              key={cat.category}
              className="badge"
              onClick={() => setFilterCat(filterCat === cat.category ? '' : cat.category)}
              style={{
                background: filterCat === cat.category
                  ? `color-mix(in srgb, ${cat.color} 20%, transparent)`
                  : 'var(--bg-elevated)',
                color: filterCat === cat.category ? cat.color : 'var(--text-secondary)',
                border: filterCat === cat.category ? `1px solid color-mix(in srgb, ${cat.color} 40%, transparent)` : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              {cat.category} · {formatCurrency(cat.amount)}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={15} style={{
          position: 'absolute', left: '0.875rem', top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-muted)',
        }} />
        <input
          id="expense-search"
          className="input"
          placeholder="Search expenses…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '2.375rem' }}
        />
      </div>

      {/* List */}
      <div className="card" style={{ padding: '0.25rem 1.25rem' }}>
        {filtered.length > 0 ? (
          filtered.map(tx => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              accounts={accounts}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="empty-state">
            <TrendingDownEmpty />
            <p style={{ fontWeight: 500 }}>No expenses found</p>
            <p style={{ fontSize: '0.8125rem' }}>Add your first expense to get started</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Add Expense
            </button>
          </div>
        )}
      </div>

      {/* Form modal */}
      <TransactionForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTx(undefined); }}
        editTx={editTx}
        defaultType="expense"
      />

      {/* Delete confirm */}
      <Modal
        isOpen={!!deleteTx}
        onClose={() => setDeleteTx(undefined)}
        title="Delete Transaction"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteTx(undefined)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete} id="confirm-delete-btn">
              <Trash2 size={14} /> Delete
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>"{deleteTx?.description}"</strong>?
          This will also reverse its effect on the account balance.
        </p>
      </Modal>
    </div>
  );
}

function TrendingDownEmpty() {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: 14,
      background: 'color-mix(in srgb, var(--danger) 10%, transparent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Filter size={22} color="var(--danger)" />
    </div>
  );
}
