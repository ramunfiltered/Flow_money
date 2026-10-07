import React from 'react';
import { formatCurrency, formatShortDate, getCategoryColor, getCategoryIcon } from '../../data/constants';
import type { Transaction, Account } from '../../types';
import { Edit2, Trash2, ArrowRight } from 'lucide-react';

interface TransactionRowProps {
  tx: Transaction;
  accounts: Account[];
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
  compact?: boolean;
}

export function TransactionRow({ tx, accounts, onEdit, onDelete, compact }: TransactionRowProps) {
  const account = accounts.find(a => a.id === tx.accountId);
  const toAccount = tx.toAccountId ? accounts.find(a => a.id === tx.toAccountId) : null;

  const amountColor = tx.type === 'expense' ? 'var(--danger)'
                    : tx.type === 'income'  ? 'var(--success)'
                    : 'var(--text-secondary)';
  const amountSign = tx.type === 'expense' ? '−' : tx.type === 'income' ? '+' : '⇄';

  const categoryIcon = tx.type === 'expense' && tx.category
    ? getCategoryIcon(tx.category) : tx.type === 'income' ? '💰' : '🔄';
  const categoryColor = tx.type === 'expense' && tx.category
    ? getCategoryColor(tx.category) : tx.type === 'income' ? '#10b981' : '#6366f1';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        padding: compact ? '0.625rem 0' : '0.875rem 0',
        borderBottom: '1px solid var(--border-muted)',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 38, height: 38,
        borderRadius: 10,
        background: `color-mix(in srgb, ${categoryColor} 12%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem', flexShrink: 0,
      }}>
        {categoryIcon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {tx.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {formatShortDate(tx.date)}
          </span>
          {!compact && (
            <>
              <span style={{ color: 'var(--border)', fontSize: '0.75rem' }}>·</span>
              <span style={{
                fontSize: '0.6875rem', fontWeight: 500,
                color: categoryColor,
                background: `color-mix(in srgb, ${categoryColor} 10%, transparent)`,
                padding: '0.125rem 0.5rem', borderRadius: 999,
              }}>
                {tx.type === 'expense' ? tx.category
                 : tx.type === 'income' ? tx.source
                 : (
                   <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                     {account?.name} <ArrowRight size={10} /> {toAccount?.name}
                   </span>
                 )}
              </span>
              {account && tx.type !== 'transfer' && (
                <>
                  <span style={{ color: 'var(--border)', fontSize: '0.75rem' }}>·</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {account.name}
                  </span>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: amountColor }}>
          {amountSign}{formatCurrency(tx.amount)}
        </p>
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && !compact && (
        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
          {onEdit && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onEdit(tx)}
              aria-label="Edit transaction"
              title="Edit"
            >
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onDelete(tx)}
              aria-label="Delete transaction"
              title="Delete"
              style={{ color: 'var(--danger)' }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
