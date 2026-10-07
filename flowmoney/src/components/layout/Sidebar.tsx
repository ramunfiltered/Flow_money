import React from 'react';
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  CreditCard,
  ArrowLeftRight,
  Target,
  BarChart3,
  Settings,
  Sun,
  Moon,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type Page =
  | 'dashboard'
  | 'expenses'
  | 'income'
  | 'accounts'
  | 'transfers'
  | 'budgets'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Dashboard',  icon: <LayoutDashboard size={17} /> },
  { page: 'expenses',  label: 'Expenses',   icon: <TrendingDown size={17} /> },
  { page: 'income',    label: 'Income',     icon: <TrendingUp size={17} /> },
  { page: 'accounts',  label: 'Accounts',   icon: <CreditCard size={17} /> },
  { page: 'transfers', label: 'Transfers',  icon: <ArrowLeftRight size={17} /> },
  { page: 'budgets',   label: 'Budgets',    icon: <Target size={17} /> },
  { page: 'analytics', label: 'Analytics',  icon: <BarChart3 size={17} /> },
  { page: 'settings',  label: 'Settings',   icon: <Settings size={17} /> },
];

export function Sidebar({ activePage, onNavigate, mobileOpen, onMobileClose }: SidebarProps) {
  const { state, setTheme } = useApp();

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{
        padding: '1.25rem 1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={16} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            FlowMoney
          </span>
        </div>
        {onMobileClose && (
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onMobileClose}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.page}
            className={`sidebar-link ${activePage === item.page ? 'active' : ''}`}
            onClick={() => { onNavigate(item.page); onMobileClose?.(); }}
            id={`nav-${item.page}`}
          >
            {item.icon}
            {item.label}
            {activePage === item.page && <span className="nav-dot" style={{ marginLeft: 'auto' }} />}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
        <button
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => setTheme(state.theme === 'dark' ? 'light' : 'dark')}
          id="toggle-theme-btn"
        >
          {state.theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          {state.theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar" style={{ display: 'none' }} id="desktop-sidebar">
        {content}
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex',
          }}
          onClick={e => { if (e.target === e.currentTarget) onMobileClose?.(); }}
        >
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            position: 'absolute', inset: 0,
            backdropFilter: 'blur(2px)',
          }} onClick={onMobileClose} />
          <aside style={{
            position: 'relative', width: 240,
            background: 'var(--bg-card)',
            borderRight: '1px solid var(--border)',
            height: '100%',
            animation: 'slideIn 0.22s ease',
            zIndex: 1,
          }}>
            {content}
          </aside>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          #desktop-sidebar { display: flex !important; }
        }
      `}</style>
    </>
  );
}

// Bottom nav for mobile
export function BottomNav({ activePage, onNavigate }: { activePage: Page; onNavigate: (page: Page) => void }) {
  const BOTTOM_ITEMS = NAV_ITEMS.slice(0, 5); // Show first 5
  return (
    <nav className="bottom-nav" id="bottom-nav" style={{ display: 'flex' }}>
      {BOTTOM_ITEMS.map(item => (
        <button
          key={item.page}
          className={`bottom-nav-item ${activePage === item.page ? 'active' : ''}`}
          onClick={() => onNavigate(item.page)}
          id={`bottom-nav-${item.page}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
