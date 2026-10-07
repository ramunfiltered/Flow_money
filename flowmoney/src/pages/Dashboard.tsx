import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';
import {
  Wallet, TrendingDown, TrendingUp, Target, CreditCard,
  ArrowRight, Lightbulb,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getMonthSummary, getCategoryBreakdown, getDailySpending,
  getSpendingTrend, getInsights,
} from '../data/dataService';
import { formatCurrency, getMonthYear, MONTHS } from '../data/constants';
import { MonthSelector } from '../components/ui/MonthSelector';
import { StatCard } from '../components/ui/StatCard';
import { TransactionRow } from '../components/ui/TransactionRow';

// Custom tooltip for charts
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '0.625rem 0.875rem',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</p>
      <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

const HOUR = new Date().getHours();
const GREETING = HOUR < 12 ? 'Good morning' : HOUR < 17 ? 'Good afternoon' : 'Good evening';

export function Dashboard() {
  const { state, setMonth } = useApp();
  const { accounts, transactions, budgets, selectedMonth, selectedYear } = state;

  const summary   = useMemo(() => getMonthSummary(accounts, transactions, budgets, selectedMonth, selectedYear), [accounts, transactions, budgets, selectedMonth, selectedYear]);
  const catBreak  = useMemo(() => getCategoryBreakdown(transactions, selectedMonth, selectedYear), [transactions, selectedMonth, selectedYear]);
  const daily     = useMemo(() => getDailySpending(transactions, selectedMonth, selectedYear), [transactions, selectedMonth, selectedYear]);
  const trend     = useMemo(() => getSpendingTrend(transactions, selectedMonth, selectedYear), [transactions, selectedMonth, selectedYear]);
  const insights  = useMemo(() => getInsights(transactions, selectedMonth, selectedYear, catBreak), [transactions, selectedMonth, selectedYear, catBreak]);

  const recentTxs = useMemo(() =>
    transactions
      .filter(tx => {
        const d = new Date(tx.date + 'T00:00:00');
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      })
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6),
    [transactions, selectedMonth, selectedYear],
  );

  // Only show days up to today in the current month
  const chartData = daily.filter(d => d.amount > 0 || d.day <= new Date().getDate());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{GREETING}</p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Sreeram 👋
          </h1>
        </div>
        <MonthSelector month={selectedMonth} year={selectedYear} onChange={setMonth} />
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '0.875rem',
      }}>
        <StatCard
          label="Total Available"
          value={summary.totalAvailable}
          icon={<Wallet size={18} color="var(--accent)" />}
          iconBg="var(--accent-light)"
        />
        <StatCard
          label="Spent This Month"
          value={summary.totalExpenses}
          icon={<TrendingDown size={18} color="var(--danger)" />}
          iconBg="color-mix(in srgb, var(--danger) 12%, transparent)"
          valueColor="var(--danger)"
          trend={trend.changePercent !== 0 ? { value: trend.changePercent, label: 'vs last month' } : undefined}
        />
        <StatCard
          label="Income"
          value={summary.totalIncome}
          icon={<TrendingUp size={18} color="var(--success)" />}
          iconBg="color-mix(in srgb, var(--success) 12%, transparent)"
          valueColor="var(--success)"
        />
        <StatCard
          label="Remaining Budget"
          value={Math.abs(summary.remaining)}
          icon={<Target size={18} color={summary.remaining >= 0 ? 'var(--warning)' : 'var(--danger)'} />}
          iconBg={summary.remaining >= 0 ? 'color-mix(in srgb, var(--warning) 12%, transparent)' : 'color-mix(in srgb, var(--danger) 10%, transparent)'}
          valueColor={summary.remaining >= 0 ? 'var(--warning)' : 'var(--danger)'}
          subtitle={summary.remaining < 0 ? 'Over budget' : `of ${formatCurrency(summary.budget)} budget`}
        />
        <StatCard
          label="Credit Outstanding"
          value={summary.creditOutstanding}
          icon={<CreditCard size={18} color="var(--text-secondary)" />}
          iconBg="var(--bg-elevated)"
          valueColor={summary.creditOutstanding > 0 ? 'var(--danger)' : 'var(--success)'}
          subtitle="Across all credit cards"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '0.875rem' }}>
        {/* Daily Spending Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Daily Spending
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                {getMonthYear(selectedMonth, selectedYear)}
              </p>
            </div>
            <div style={{
              fontSize: '0.8125rem', fontWeight: 600,
              color: trend.changePercent <= 0 ? 'var(--success)' : 'var(--danger)',
              background: trend.changePercent <= 0
                ? 'color-mix(in srgb, var(--success) 10%, transparent)'
                : 'color-mix(in srgb, var(--danger) 10%, transparent)',
              padding: '0.25rem 0.625rem', borderRadius: 6,
            }}>
              {trend.changePercent > 0 ? '+' : ''}{trend.changePercent}% vs {MONTHS[selectedMonth === 1 ? 11 : selectedMonth - 2]}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border-muted)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={false} tickLine={false}
                interval={4}
              />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--accent)"
                strokeWidth={2}
                fill="url(#spendGrad)"
                dot={false}
                activeDot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Donut */}
        <div className="card">
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            By Category
          </h2>
          {catBreak.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={catBreak}
                    cx="50%" cy="50%"
                    innerRadius={42} outerRadius={62}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {catBreak.map(entry => (
                      <Cell key={entry.category} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [formatCurrency(val), '']}
                    contentStyle={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 10, fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                {catBreak.slice(0, 4).map(cat => (
                  <div key={cat.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{cat.category}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {formatCurrency(cat.amount)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <p style={{ fontSize: '0.875rem' }}>No expenses this month</p>
            </div>
          )}
        </div>
      </div>

      {/* Budget Progress */}
      {summary.budget > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Budget Progress</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                {getMonthYear(selectedMonth, selectedYear)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {formatCurrency(summary.totalExpenses)} of {formatCurrency(summary.budget)}
              </p>
              <p style={{
                fontSize: '0.8125rem', fontWeight: 600,
                color: summary.remaining >= 0 ? 'var(--success)' : 'var(--danger)',
              }}>
                {summary.remaining >= 0 ? `${formatCurrency(summary.remaining)} left` : `${formatCurrency(Math.abs(summary.remaining))} over`}
              </p>
            </div>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, (summary.totalExpenses / summary.budget) * 100)}%`,
                background: summary.totalExpenses > summary.budget ? 'var(--danger)'
                          : summary.totalExpenses > summary.budget * 0.8 ? 'var(--warning)'
                          : 'var(--success)',
              }}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {Math.min(100, Math.round((summary.totalExpenses / summary.budget) * 100))}% of budget used
          </p>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="card" style={{ background: 'var(--accent-light)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
            <Lightbulb size={16} color="var(--accent)" />
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--accent)' }}>Insights</h2>
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

      {/* Recent Transactions */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Transactions</h2>
        </div>
        {recentTxs.length > 0 ? (
          <div>
            {recentTxs.map(tx => (
              <TransactionRow key={tx.id} tx={tx} accounts={accounts} compact />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No transactions this month</p>
          </div>
        )}
      </div>
    </div>
  );
}
