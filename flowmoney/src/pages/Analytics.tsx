import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
  LineChart, Line,
} from 'recharts';
import { Lightbulb } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MonthSelector } from '../components/ui/MonthSelector';
import {
  getMonthSummary, getCategoryBreakdown, getDailySpending,
  getAccountSummaries, getInsights,
} from '../data/dataService';
import { formatCurrency, MONTHS, isSameMonth } from '../data/constants';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)',
      marginBottom: '1rem',
    }}>
      {children}
    </h2>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="card-elevated" style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</p>
      <p style={{ fontSize: '1.125rem', fontWeight: 700, color: color ?? 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

export function Analytics() {
  const { state, setMonth } = useApp();
  const { accounts, transactions, budgets, selectedMonth, selectedYear } = state;

  const summary   = useMemo(() => getMonthSummary(accounts, transactions, budgets, selectedMonth, selectedYear), [accounts, transactions, budgets, selectedMonth, selectedYear]);
  const catBreak  = useMemo(() => getCategoryBreakdown(transactions, selectedMonth, selectedYear), [transactions, selectedMonth, selectedYear]);
  const daily     = useMemo(() => getDailySpending(transactions, selectedMonth, selectedYear), [transactions, selectedMonth, selectedYear]);
  const accSumm   = useMemo(() => getAccountSummaries(accounts, transactions, selectedMonth, selectedYear), [accounts, transactions, selectedMonth, selectedYear]);
  const insights  = useMemo(() => getInsights(transactions, selectedMonth, selectedYear, catBreak), [transactions, selectedMonth, selectedYear, catBreak]);

  // Monthly comparison (last 5 months)
  const monthlyData = useMemo(() => {
    const result = [];
    for (let i = 4; i >= 0; i--) {
      let m = selectedMonth - i;
      let y = selectedYear;
      while (m <= 0) { m += 12; y -= 1; }
      const s = getMonthSummary(accounts, transactions, budgets, m, y);
      result.push({
        name: MONTHS[m - 1].slice(0, 3),
        expenses: s.totalExpenses,
        income: s.totalIncome,
        budget: s.budget,
      });
    }
    return result;
  }, [accounts, transactions, budgets, selectedMonth, selectedYear]);

  // Account-wise spending
  const accountData = accSumm
    .filter(s => s.monthExpenses > 0)
    .sort((a, b) => b.monthExpenses - a.monthExpenses)
    .map(s => ({
      name: s.account.name.replace('Bank of Baroda', 'BoB').replace('Canara Bank', 'Canara'),
      amount: s.monthExpenses,
      color: s.account.color,
    }));

  // Stats
  const daysWithSpend = daily.filter(d => d.amount > 0);
  const avgDaily = daysWithSpend.length > 0 ? Math.round(summary.totalExpenses / daysWithSpend.length) : 0;
  const highestDay = [...daily].sort((a, b) => b.amount - a.amount)[0];

  const customTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '0.625rem 0.875rem', boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          Analytics
        </h1>
        <MonthSelector month={selectedMonth} year={selectedYear} onChange={setMonth} />
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.625rem' }}>
        <Stat label="Total Spent"    value={formatCurrency(summary.totalExpenses)} color="var(--danger)" />
        <Stat label="Total Income"   value={formatCurrency(summary.totalIncome)}   color="var(--success)" />
        <Stat label="Avg Daily"      value={formatCurrency(avgDaily)} />
        <Stat label="Highest Day"    value={highestDay?.amount > 0 ? formatCurrency(highestDay.amount) : '—'} />
        <Stat label="Budget Used"    value={summary.budget > 0 ? `${Math.round((summary.totalExpenses / summary.budget) * 100)}%` : '—'} />
        <Stat label="Net Savings"    value={formatCurrency(summary.totalIncome - summary.totalExpenses)} color={summary.totalIncome >= summary.totalExpenses ? 'var(--success)' : 'var(--danger)'} />
      </div>

      {/* Monthly comparison */}
      <div className="card">
        <SectionTitle>Income vs Expenses (5 Months)</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData} barGap={4} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="var(--border-muted)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip content={customTooltip as any} />
            <Bar dataKey="income"   fill="var(--success)" radius={[4, 4, 0, 0]} name="Income"   maxBarSize={36} />
            <Bar dataKey="expenses" fill="var(--danger)"  radius={[4, 4, 0, 0]} name="Expenses" maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.75rem' }}>
          {[{ color: 'var(--success)', label: 'Income' }, { color: 'var(--danger)', label: 'Expenses' }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category breakdown + Account spending */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
        {/* Category */}
        <div className="card">
          <SectionTitle>Category Breakdown</SectionTitle>
          {catBreak.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {catBreak.map(cat => (
                  <div key={cat.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.color }} />
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{cat.category}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {formatCurrency(cat.amount)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 30, textAlign: 'right' }}>
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${cat.percentage}%`, background: cat.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><p>No expenses this month</p></div>
          )}
        </div>

        {/* Account spending */}
        <div className="card">
          <SectionTitle>Account-wise Spending</SectionTitle>
          {accountData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={accountData}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--border-muted)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={55} />
                <Tooltip content={customTooltip as any} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} name="Spent" maxBarSize={18}>
                  {accountData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No account spending this month</p></div>
          )}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="card" style={{ background: 'var(--accent-light)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
            <Lightbulb size={16} color="var(--accent)" />
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--accent)' }}>Smart Insights</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {insights.map((ins, i) => (
              <p key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0 }}>·</span>
                {ins}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
