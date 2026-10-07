import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTHS } from '../../data/constants';

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  const prev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };
  const next = () => {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <button className="btn btn-ghost btn-icon btn-sm" onClick={prev} aria-label="Previous month">
        <ChevronLeft size={16} />
      </button>
      <span style={{
        fontSize: '0.9375rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        minWidth: '140px',
        textAlign: 'center',
      }}>
        {MONTHS[month - 1]} {year}
      </span>
      <button className="btn btn-ghost btn-icon btn-sm" onClick={next} aria-label="Next month">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
