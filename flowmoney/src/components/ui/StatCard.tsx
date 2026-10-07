import React from 'react';
import { formatCurrency } from '../../data/constants';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  trend?: { value: number; label: string };
  valueColor?: string;
  subtitle?: string;
}

export function StatCard({ label, value, icon, iconBg, trend, valueColor, subtitle }: StatCardProps) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.375rem' }}>
            {label}
          </p>
          <p style={{
            fontSize: '1.625rem',
            fontWeight: 700,
            color: valueColor ?? 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}>
            {formatCurrency(value)}
          </p>
          {subtitle && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{
          width: 40, height: 40,
          borderRadius: 10,
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {trend && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.375rem 0.625rem',
          borderRadius: 6,
          background: trend.value <= 0 ? 'color-mix(in srgb, var(--success) 10%, transparent)'
                                        : 'color-mix(in srgb, var(--danger) 10%, transparent)',
          width: 'fit-content',
        }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600,
            color: trend.value <= 0 ? 'var(--success)' : 'var(--danger)',
          }}>
            {trend.value > 0 ? '▲' : '▼'} {Math.abs(trend.value)}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
