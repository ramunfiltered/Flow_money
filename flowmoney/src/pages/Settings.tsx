import React from 'react';
import { Sun, Moon, IndianRupee, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORY_CONFIG } from '../data/constants';

export function Settings() {
  const { state, setTheme } = useApp();
  const { theme, accounts } = state;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          Settings
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Customize your FlowMoney experience
        </p>
      </div>

      {/* Appearance */}
      <section className="card">
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Appearance
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {(['light', 'dark'] as const).map(t => (
            <button
              key={t}
              id={`theme-${t}-btn`}
              onClick={() => setTheme(t)}
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: 10,
                border: `2px solid ${theme === t ? 'var(--accent)' : 'var(--border)'}`,
                background: theme === t ? 'var(--accent-light)' : 'var(--bg-elevated)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.15s',
              }}
            >
              {t === 'light' ? <Sun size={22} color={theme === 'light' ? 'var(--accent)' : 'var(--text-muted)'} />
                             : <Moon size={22} color={theme === 'dark' ? 'var(--accent)' : 'var(--text-muted)'} />}
              <span style={{
                fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize',
                color: theme === t ? 'var(--accent)' : 'var(--text-secondary)',
              }}>{t} Mode</span>
            </button>
          ))}
        </div>
      </section>

      {/* Currency */}
      <section className="card">
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Currency
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--bg-elevated)', borderRadius: 10 }}>
          <IndianRupee size={18} color="var(--accent)" />
          <div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Indian Rupee (₹)</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>INR — Default currency</p>
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.625rem' }}>
          Multi-currency support coming soon.
        </p>
      </section>

      {/* Categories */}
      <section className="card">
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Categories
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
          {CATEGORY_CONFIG.map(cat => (
            <div key={cat.name} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 0.75rem',
              background: `color-mix(in srgb, ${cat.color} 8%, var(--bg-elevated))`,
              borderRadius: 8,
              border: `1px solid color-mix(in srgb, ${cat.color} 20%, transparent)`,
            }}>
              <span style={{ fontSize: '1rem' }}>{cat.icon}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: cat.color }}>{cat.name}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.625rem' }}>
          Custom category management coming soon.
        </p>
      </section>

      {/* Accounts summary */}
      <section className="card">
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Your Accounts ({accounts.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {accounts.map(acc => (
            <div key={acc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: acc.color }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{acc.name}</span>
              </div>
              <span className="badge" style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-muted)',
                fontSize: '0.7rem',
              }}>
                {acc.type === 'credit_card' ? 'Credit Card' : 'Savings'}
              </span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.625rem' }}>
          Account management coming soon.
        </p>
      </section>

      {/* About */}
      <section className="card" style={{ background: 'var(--bg-elevated)', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
          <Info size={16} color="var(--text-muted)" />
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>About FlowMoney</h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          FlowMoney is your personal finance dashboard for tracking expenses, income, and budgets across all your bank accounts and credit cards. Built for daily use with a Google Sheets–ready data layer.
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Version 1.0.0 · Designed for Sreeram
        </p>
      </section>
    </div>
  );
}
