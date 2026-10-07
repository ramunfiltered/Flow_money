import React, { useState, useMemo } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getMonthSummary } from '../data/dataService';
import { formatCurrency, getMonthYear, MONTHS, generateId } from '../data/constants';
import { useToast } from '../components/ui/Toast';
import type { Budget } from '../types';

const DISPLAY_MONTHS = [
  { month: 8, year: 2026 },
  { month: 9, year: 2026 },
  { month: 10, year: 2026 },
  { month: 11, year: 2026 },
  { month: 12, year: 2026 },
  { month: 1, year: 2027 },
];

export function Budgets() {
  const { state, upsertBudget, setMonth } = useApp();
  const { accounts, transactions, budgets, selectedMonth, selectedYear } = state;
  const { show } = useToast();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  const startEdit = (m: number, y: number, current: number) => {
    setEditingKey(`${m}-${y}`);
    setEditVal(String(current || ''));
  };

  const saveEdit = (m: number, y: number) => {
    const val = parseFloat(editVal);
    if (isNaN(val) || val < 0) { show('Enter a valid amount', 'error'); return; }
    const existing = budgets.find(b => b.month === m && b.year === y);
    upsertBudget({ id: existing?.id ?? generateId(), month: m, year: y, amount: val });
    show('Budget updated');
    setEditingKey(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          Budgets
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Set a different budget for each month and track your spending against it.
        </p>
      </div>

      {/* Budget cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {DISPLAY_MONTHS.map(({ month, year }) => {
          const budget = budgets.find(b => b.month === month && b.year === year);
          const amount = budget?.amount ?? 0;
          const summary = getMonthSummary(accounts, transactions, budgets, month, year);
          const spent = summary.totalExpenses;
          const remaining = amount - spent;
          const pct = amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0;
          const isActive = month === selectedMonth && year === selectedYear;
          const key = `${month}-${year}`;
          const isEditing = editingKey === key;

          const barColor = spent > amount && amount > 0 ? 'var(--danger)'
                         : pct > 80 ? 'var(--warning)'
                         : 'var(--success)';

          return (
            <div
              key={key}
              className="card"
              style={{
                borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                background: isActive ? 'var(--accent-light)' : 'var(--bg-card)',
                cursor: 'pointer',
              }}
              onClick={() => setMonth(month, year)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.875rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {getMonthYear(month, year)}
                    </h3>
                    {isActive && (
                      <span className="badge" style={{
                        background: 'var(--accent)', color: '#fff', fontSize: '0.6875rem',
                      }}>
                        Current
                      </span>
                    )}
                  </div>

                  {/* Budget amount (editable) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Budget:</span>
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }} onClick={e => e.stopPropagation()}>
                        <input
                          id={`budget-input-${key}`}
                          className="input"
                          type="number"
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          autoFocus
                          style={{ width: 120, fontSize: '0.875rem', padding: '0.375rem 0.625rem' }}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(month, year); if (e.key === 'Escape') setEditingKey(null); }}
                        />
                        <button className="btn btn-primary btn-sm btn-icon" onClick={() => saveEdit(month, year)} aria-label="Save">
                          <Check size={13} />
                        </button>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditingKey(null)} aria-label="Cancel">
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {amount > 0 ? formatCurrency(amount) : 'Not set'}
                        </span>
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{ padding: '0.2rem' }}
                          onClick={e => { e.stopPropagation(); startEdit(month, year, amount); }}
                          aria-label={`Edit budget for ${getMonthYear(month, year)}`}
                        >
                          <Edit2 size={13} color="var(--text-muted)" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {amount > 0 && (
                    <>
                      <div className="progress-track" style={{ marginBottom: '0.5rem' }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: barColor }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>Spent: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(spent)}</strong></span>
                        <span style={{ color: remaining < 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                          {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
                        </span>
                      </div>
                    </>
                  )}

                  {amount === 0 && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Click the edit icon to set a budget for this month
                    </p>
                  )}
                </div>

                {/* Pct indicator */}
                {amount > 0 && (
                  <div style={{
                    width: 52, height: 52,
                    borderRadius: '50%',
                    background: `conic-gradient(${barColor} ${pct}%, var(--bg-elevated) ${pct}%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: isActive ? 'var(--accent-light)' : 'var(--bg-card)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: barColor }}>{pct}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
