import React from 'react';
import { CheckSquare, Moon, Sun, Plus, LogOut, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTasks } from '../context/TaskContext.jsx';

export function Header() {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { openCreateModal } = useTasks();

  return (
    <header className="header">
      <div className="header-left">
        <div className="brand-logo">
          <CheckSquare size={26} color="#6366f1" />
          <span>TaskFlow</span>
        </div>
      </div>

      <div className="header-right">
        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          title="Criar nova tarefa"
        >
          <Plus size={18} />
          <span>Nova Tarefa</span>
        </button>

        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          aria-label="Alternar tema"
        >
          {isDark ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} />}
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-muted)',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              <User size={16} color="var(--brand-primary)" />
              <span>{user.name}</span>
            </div>

            <button
              onClick={logout}
              className="btn-icon"
              title="Sair da conta"
              aria-label="Sair"
            >
              <LogOut size={18} color="var(--color-danger)" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
