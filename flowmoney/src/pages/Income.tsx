import React, { useState, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MonthSelector } from '../components/ui/MonthSelector';
import { TransactionRow } from '../components/ui/TransactionRow';
import { TransactionForm } from '../components/forms/TransactionForm';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { filterTransactions } from '../data/dataService';
import { formatCurrency, INCOME_SOURCES } from '../data/constants';
import type { Transaction } from '../types';

export function Income() {
  const { state, setMonth, deleteTransaction } = useApp();
  const { accounts, transactions, selectedMonth, selectedYear } = state;
  const { show } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | undefined>();
  const [deleteTx, setDeleteTx] = useState<Transaction | undefined>();
  const [filterSrc, setFilterSrc] = useState('');

  const filtered = useMemo(() =>
    filterTransactions(transactions, {
      month: selectedMonth, year: selectedYear,
      type: 'income',
    }).filter(tx => !filterSrc || tx.source === filterSrc),
    [transactions, selectedMonth, selectedYear, filterSrc],
  );

  const total = filtered.reduce((s, tx) => s + tx.amount, 0);

  // Source breakdown
  const sourceMap: Record<string, number> = {};
  for (const tx of filtered) {
    const s = tx.source ?? 'Other';
    sourceMap[s] = (sourceMap[s] ?? 0) + tx.amount;
  }

  const handleEdit = (tx: Transaction) => { setEditTx(tx); setShowForm(true); };
  const confirmDelete = () => {
    if (!deleteTx) return;
    deleteTransaction(deleteTx.id);
    show('Income removed', 'info');
    setDeleteTx(undefined);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            Income
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
            {filtered.length} transactions · {formatCurrency(total)}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <MonthSelector month={selectedMonth} year={selectedYear} onChange={setMonth} />
          <button
            id="add-income-btn"
            className="btn btn-primary"
            style={{ background: 'var(--success)' }}
            onClick={() => { setEditTx(undefined); setShowForm(true); }}
          >
            <Plus size={16} /> Add Income
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
        {Object.entries(sourceMap).map(([src, amt]) => (
          <div key={src} className="card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{src}</p>
            <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(amt)}</p>
          </div>
        ))}
      </div>

      {/* Source filter */}
      {Object.keys(sourceMap).length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="badge"
            onClick={() => setFilterSrc('')}
            style={{
              background: !filterSrc ? 'var(--success)' : 'var(--bg-elevated)',
              color: !filterSrc ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer', border: 'none',
            }}
          >All</button>
          {Object.keys(sourceMap).map(src => (
            <button
              key={src}
              className="badge"
              onClick={() => setFilterSrc(filterSrc === src ? '' : src)}
              style={{
                background: filterSrc === src ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'var(--bg-elevated)',
                color: filterSrc === src ? 'var(--success)' : 'var(--text-secondary)',
                cursor: 'pointer', border: '1px solid transparent',
              }}
            >{src}</button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="card" style={{ padding: '0.25rem 1.25rem' }}>
        {filtered.length > 0 ? (
          filtered.map(tx => (
            <TransactionRow
              key={tx.id} tx={tx} accounts={accounts}
              onEdit={handleEdit}
              onDelete={tx => setDeleteTx(tx)}
            />
          ))
        ) : (
          <div className="empty-state">
            <p style={{ fontWeight: 500 }}>No income this month</p>
            <button className="btn btn-sm" onClick={() => setShowForm(true)}
              style={{ background: 'var(--success)', color: '#fff' }}>
              <Plus size={14} /> Add Income
            </button>
          </div>
        )}
      </div>

      <TransactionForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTx(undefined); }}
        editTx={editTx}
        defaultType="income"
      />

      <Modal
        isOpen={!!deleteTx}
        onClose={() => setDeleteTx(undefined)}
        title="Remove Income"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteTx(undefined)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete} id="confirm-delete-income-btn">
              <Trash2 size={14} /> Remove
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Remove <strong style={{ color: 'var(--text-primary)' }}>"{deleteTx?.description}"</strong>?
          This will reverse its effect on the account balance.
        </p>
      </Modal>
    </div>
  );
}
