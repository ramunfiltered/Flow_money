import React, { useState, useMemo } from 'react';
import { Building2, CreditCard, ChevronRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MonthSelector } from '../components/ui/MonthSelector';
import { TransactionRow } from '../components/ui/TransactionRow';
import { getAccountSummaries } from '../data/dataService';
import { formatCurrency, formatShortDate } from '../data/constants';
import type { Account } from '../types';

function AccountCard({ summary, onClick, month, year }: {
  summary: ReturnType<typeof getAccountSummaries>[0];
  onClick: () => void;
  month: number; year: number;
}) {
  const { account, monthExpenses, monthIncome } = summary;
  const isCC = account.type === 'credit_card';

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        transition: 'all 0.15s',
        gap: '0.875rem',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
    >
      {/* Color dot + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: `color-mix(in srgb, ${account.color} 15%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isCC
            ? <CreditCard size={18} color={account.color} />
            : <Building2 size={18} color={account.color} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{account.name}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isCC ? 'Credit Card' : 'Savings Account'}
          </p>
        </div>
      </div>

      {/* Balance */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{
          fontSize: '1rem', fontWeight: 700,
          color: isCC
            ? account.balance > 0 ? 'var(--danger)' : 'var(--success)'
            : 'var(--text-primary)',
        }}>
          {isCC && account.balance > 0 ? '−' : ''}{formatCurrency(account.balance)}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {isCC ? 'Outstanding' : 'Balance'}
        </p>
      </div>

      <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
    </button>
  );
}

function AccountDetail({ account, summaries, onBack, month, year }: {
  account: Account;
  summaries: ReturnType<typeof getAccountSummaries>;
  onBack: () => void;
  month: number; year: number;
}) {
  const { state } = useApp();
  const summary = summaries.find(s => s.account.id === account.id)!;
  const isCC = account.type === 'credit_card';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ width: 'fit-content' }}>
        <ArrowLeft size={15} /> Back to Accounts
      </button>

      {/* Account hero */}
      <div className="card" style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${account.color} 12%, var(--bg-card)), var(--bg-card))`,
        borderColor: `color-mix(in srgb, ${account.color} 25%, var(--border))`,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `color-mix(in srgb, ${account.color} 20%, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isCC ? <CreditCard size={20} color={account.color} /> : <Building2 size={20} color={account.color} />}
              </div>
              <div>
                <p style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>{account.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {isCC ? 'Credit Card' : 'Savings Account'}
                </p>
              </div>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: isCC ? 'var(--danger)' : 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {isCC && account.balance > 0 ? '−' : ''}{formatCurrency(account.balance)}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {isCC ? 'Current outstanding' : 'Current balance'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="card-elevated" style={{ textAlign: 'center', minWidth: 100 }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Spent this month</p>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--danger)' }}>{formatCurrency(summary.monthExpenses)}</p>
            </div>
            {!isCC && (
              <div className="card-elevated" style={{ textAlign: 'center', minWidth: 100 }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Income this month</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(summary.monthIncome)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card" style={{ padding: '0.25rem 1.25rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', padding: '0.875rem 0' }}>
          Recent Activity
        </h3>
        {summary.recentTransactions.length > 0
          ? summary.recentTransactions.map(tx => (
              <TransactionRow key={tx.id} tx={tx} accounts={state.accounts} compact />
            ))
          : <div className="empty-state"><p>No recent transactions</p></div>}
      </div>
    </div>
  );
}

export function Accounts() {
  const { state, setMonth } = useApp();
  const { accounts, transactions, selectedMonth, selectedYear } = state;
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const summaries = useMemo(
    () => getAccountSummaries(accounts, transactions, selectedMonth, selectedYear),
    [accounts, transactions, selectedMonth, selectedYear],
  );

  const savings = summaries.filter(s => s.account.type === 'savings');
  const creditCards = summaries.filter(s => s.account.type === 'credit_card');

  const totalBalance = accounts.filter(a => a.type === 'savings').reduce((s, a) => s + a.balance, 0);
  const totalOutstanding = accounts.filter(a => a.type === 'credit_card').reduce((s, a) => s + a.balance, 0);

  if (selectedAccount) {
    return (
      <AccountDetail
        account={selectedAccount}
        summaries={summaries}
        onBack={() => setSelectedAccount(null)}
        month={selectedMonth}
        year={selectedYear}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          Accounts
        </h1>
        <MonthSelector month={selectedMonth} year={selectedYear} onChange={setMonth} />
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="card">
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Total Available</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            {formatCurrency(totalBalance)}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Across {savings.length} bank accounts
          </p>
        </div>
        <div className="card">
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Total Outstanding</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: totalOutstanding > 0 ? 'var(--danger)' : 'var(--success)', letterSpacing: '-0.025em' }}>
            {formatCurrency(totalOutstanding)}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Across {creditCards.length} credit cards
          </p>
        </div>
      </div>

      {/* Bank accounts */}
      <section>
        <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
          Bank & Savings
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {savings.map(s => (
            <AccountCard key={s.account.id} summary={s} onClick={() => setSelectedAccount(s.account)} month={selectedMonth} year={selectedYear} />
          ))}
        </div>
      </section>

      {/* Credit cards */}
      <section>
        <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
          Credit Cards
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {creditCards.map(s => (
            <AccountCard key={s.account.id} summary={s} onClick={() => setSelectedAccount(s.account)} month={selectedMonth} year={selectedYear} />
          ))}
        </div>
      </section>
    </div>
  );
}
