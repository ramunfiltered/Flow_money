import React, { useState, useMemo } from 'react';
import { Plus, ArrowRight, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MonthSelector } from '../components/ui/MonthSelector';
import { TransactionForm } from '../components/forms/TransactionForm';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { filterTransactions } from '../data/dataService';
import { formatCurrency, formatShortDate } from '../data/constants';
import type { Transaction } from '../types';

export function Transfers() {
  const { state, setMonth, deleteTransaction } = useApp();
  const { accounts, transactions, selectedMonth, selectedYear } = state;
  const { show } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [deleteTx, setDeleteTx] = useState<Transaction | undefined>();

  const filtered = useMemo(() =>
    filterTransactions(transactions, { month: selectedMonth, year: selectedYear, type: 'transfer' }),
    [transactions, selectedMonth, selectedYear],
  );

  const totalTransferred = filtered.reduce((s, tx) => s + tx.amount, 0);

  const confirmDelete = () => {
    if (!deleteTx) return;
    deleteTransaction(deleteTx.id);
    show('Transfer removed', 'info');
    setDeleteTx(undefined);
  };

  const getAccount = (id: string) => accounts.find(a => a.id === id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            Transfers
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
            {filtered.length} transfers · {formatCurrency(totalTransferred)} moved
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <MonthSelector month={selectedMonth} year={selectedYear} onChange={setMonth} />
          <button
            id="add-transfer-btn"
            className="btn btn-primary"
            style={{ background: 'var(--accent)' }}
            onClick={() => setShowForm(true)}
          >
            <Plus size={16} /> New Transfer
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        padding: '0.875rem 1rem',
        borderRadius: 10,
        background: 'var(--accent-light)',
        border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
        fontSize: '0.8125rem',
        color: 'var(--text-secondary)',
      }}>
        💡 Transfers between your accounts do not count as expenses. When you pay a credit card bill, select the CC as the <em>To Account</em> — it will reduce the outstanding balance.
      </div>

      {/* Transfer list */}
      <div className="card" style={{ padding: '0.25rem 1.25rem' }}>
        {filtered.length > 0 ? filtered.map(tx => {
          const from = getAccount(tx.accountId);
          const to = tx.toAccountId ? getAccount(tx.toAccountId) : null;
          return (
            <div key={tx.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              padding: '0.875rem 0',
              borderBottom: '1px solid var(--border-muted)',
            }}>
              {/* Icon */}
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'var(--accent-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ArrowRight size={16} color="var(--accent)" />
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {tx.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 500,
                    color: from?.color ?? 'var(--text-muted)',
                  }}>{from?.name}</span>
                  <ArrowRight size={11} color="var(--text-muted)" />
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 500,
                    color: to?.color ?? 'var(--text-muted)',
                  }}>{to?.name}</span>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatShortDate(tx.date)}</span>
                  {to?.type === 'credit_card' && (
                    <span className="badge" style={{
                      background: 'color-mix(in srgb, var(--success) 12%, transparent)',
                      color: 'var(--success)', fontSize: '0.6875rem',
                    }}>Bill Payment</span>
                  )}
                </div>
              </div>
              {/* Amount */}
              <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--accent)', flexShrink: 0 }}>
                {formatCurrency(tx.amount)}
              </p>
              {/* Delete */}
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => setDeleteTx(tx)}
                style={{ color: 'var(--danger)', flexShrink: 0 }}
                aria-label="Delete transfer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        }) : (
          <div className="empty-state">
            <p style={{ fontWeight: 500 }}>No transfers this month</p>
            <p style={{ fontSize: '0.8125rem' }}>Use transfers to move money between accounts or pay credit card bills</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
              <Plus size={14} /> New Transfer
            </button>
          </div>
        )}
      </div>

      <TransactionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        defaultType="transfer"
      />

      <Modal
        isOpen={!!deleteTx}
        onClose={() => setDeleteTx(undefined)}
        title="Remove Transfer"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteTx(undefined)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete} id="confirm-delete-transfer-btn">
              <Trash2 size={14} /> Remove
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Remove transfer <strong style={{ color: 'var(--text-primary)' }}>"{deleteTx?.description}"</strong>?
          This will reverse the balance changes on both accounts.
        </p>
      </Modal>
    </div>
  );
}
