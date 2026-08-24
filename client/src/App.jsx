import React from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { Header } from './components/Header.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { DashboardStats } from './components/DashboardStats.jsx';
import { QuickAddTask } from './components/QuickAddTask.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { TaskList } from './components/TaskList.jsx';
import { TaskModal } from './components/TaskModal.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { CheckSquare } from 'lucide-react';

export function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-app)',
          gap: '1rem'
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--brand-gradient)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            animation: 'bounce 1.5s infinite'
          }}
        >
          <CheckSquare size={28} />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>
          Carregando TaskFlow...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="content-body">
          <DashboardStats />
          <QuickAddTask />
          <FilterBar />
          <TaskList />
        </main>
      </div>
      <TaskModal />
    </div>
  );
}

export default App;
