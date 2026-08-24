import React from 'react';
import { CheckSquare, Inbox, Sparkles } from 'lucide-react';
import { useTasks } from '../context/TaskContext.jsx';
import { TaskItem } from './TaskItem.jsx';

export function TaskList() {
  const { tasks, loading, filters, openCreateModal } = useTasks();

  if (loading && tasks.length === 0) {
    return (
      <div className="task-list">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="task-item"
            style={{ opacity: 0.5, animation: 'pulse 1.5s infinite ease-in-out' }}
          >
            <div style={{ display: 'flex', gap: '1rem', width: '100%', alignItems: 'center' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: 'var(--border)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <div style={{ height: '16px', width: '40%', backgroundColor: 'var(--border)', borderRadius: '4px' }} />
                <div style={{ height: '12px', width: '20%', backgroundColor: 'var(--border)', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Inbox size={32} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            Nenhuma tarefa encontrada
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '360px' }}>
            {filters.search || filters.category_id !== 'all' || filters.priority !== 'all'
              ? 'Tente ajustar ou limpar os filtros para encontrar o que procura.'
              : 'Você ainda não tem tarefas cadastradas nesta visão. Comece criando sua primeira tarefa!'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ marginTop: '0.5rem' }}
        >
          <Sparkles size={16} />
          <span>Criar Primeira Tarefa</span>
        </button>
      </div>
    );
  }

  // Separa tarefas ativas e concluídas
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="task-list">
      {/* Tarefas Pendentes */}
      {pendingTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}

      {/* Seção de Concluídas (se houver e não estiver no filtro apenas pendentes) */}
      {completedTasks.length > 0 && filters.status !== 'pending' && (
        <div style={{ marginTop: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              color: 'var(--text-muted)',
              fontSize: '0.8125rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            <CheckSquare size={14} />
            <span>Concluídas ({completedTasks.length})</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
