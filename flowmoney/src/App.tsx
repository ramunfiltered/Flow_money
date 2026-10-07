import React, { useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, BottomNav, type Page } from './components/layout/Sidebar';
import { ToastProvider } from './components/ui/Toast';
import { TransactionForm } from './components/forms/TransactionForm';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { Income } from './pages/Income';
import { Accounts } from './pages/Accounts';
import { Transfers } from './pages/Transfers';
import { Budgets } from './pages/Budgets';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

// ── Inner app (needs AppProvider context) ────────────────────

function AppInner() {
  const { state } = useApp();
  const [page, setPage] = useState<Page>('dashboard');
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const PAGE_TITLES: Record<Page, string> = {
    dashboard: 'Dashboard',
    expenses: 'Expenses',
    income: 'Income',
    accounts: 'Accounts',
    transfers: 'Transfers',
    budgets: 'Budgets',
    analytics: 'Analytics',
    settings: 'Settings',
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'expenses':  return <Expenses />;
      case 'income':    return <Income />;
      case 'accounts':  return <Accounts />;
      case 'transfers': return <Transfers />;
      case 'budgets':   return <Budgets />;
      case 'analytics': return <Analytics />;
      case 'settings':  return <Settings />;
    }
  };

  return (
    <div className={state.theme} style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Desktop sidebar */}
      <Sidebar
        activePage={page}
        onNavigate={setPage}
        mobileOpen={mobileSidebar}
        onMobileClose={() => setMobileSidebar(false)}
      />

      {/* Main content */}
      <main style={{
        minHeight: '100vh',
        paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
        transition: 'margin-left 0.25s',
      }}>
        {/* Mobile header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          padding: '0.75rem 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }} id="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              id="mobile-menu-btn"
              className="btn btn-ghost btn-icon"
              onClick={() => setMobileSidebar(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {PAGE_TITLES[page]}
            </span>
          </div>
          <button
            id="quick-add-btn"
            className="btn btn-primary btn-sm"
            onClick={() => setShowQuickAdd(true)}
            style={{ borderRadius: '50%', width: 36, height: 36, padding: 0, justifyContent: 'center' }}
            aria-label="Quick add"
          >
            <Plus size={18} />
          </button>
        </header>

        {/* Page content */}
        <div style={{ padding: '1.25rem 1rem', maxWidth: 960, margin: '0 auto' }} id="page-content">
          {renderPage()}
        </div>
      </main>

      {/* Bottom nav (mobile) */}
      <BottomNav activePage={page} onNavigate={setPage} />

      {/* Quick add modal */}
      <TransactionForm
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        defaultType="expense"
      />

      {/* Toast notifications */}
      <ToastProvider />

      <style>{`
        @media (min-width: 768px) {
          main {
            margin-left: 220px;
            padding-bottom: 0;
          }
          #mobile-header { display: none; }
          #bottom-nav { display: none !important; }
          #page-content { padding: 1.75rem 2rem; }
        }
      `}</style>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────

function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

export default App;
