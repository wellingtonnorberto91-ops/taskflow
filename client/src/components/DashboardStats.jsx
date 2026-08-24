import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Layers } from 'lucide-react';
import { useTasks } from '../context/TaskContext.jsx';

export function DashboardStats() {
  const { stats, filters, setFilter } = useTasks();

  const statCards = [
    {
      id: 'total',
      label: 'Tarefas Ativas',
      value: stats.pending,
      subValue: `${stats.total} no total`,
      icon: Layers,
      color: 'var(--brand-primary)',
      bgColor: 'var(--brand-light)',
      filterKey: 'filter',
      filterVal: 'all',
      isActive: filters.filter === 'all' && filters.status !== 'completed'
    },
    {
      id: 'completed_today',
      label: 'Concluídas Hoje',
      value: stats.completedToday,
      subValue: `${stats.completionRate}% de conclusão`,
      icon: CheckCircle,
      color: 'var(--color-success)',
      bgColor: 'var(--color-success-bg)',
      filterKey: 'status',
      filterVal: 'completed',
      isActive: filters.status === 'completed'
    },
    {
      id: 'overdue',
      label: 'Tarefas Atrasadas',
      value: stats.overdue,
      subValue: stats.overdue > 0 ? 'Requer atenção imediata' : 'Tudo em dia',
      icon: Clock,
      color: 'var(--color-danger)',
      bgColor: 'var(--color-danger-bg)',
      filterKey: 'filter',
      filterVal: 'overdue',
      isActive: filters.filter === 'overdue'
    },
    {
      id: 'urgent',
      label: 'Alta Prioridade',
      value: stats.urgent,
      subValue: 'Urgentes ou Alta',
      icon: AlertTriangle,
      color: 'var(--priority-high)',
      bgColor: 'var(--priority-high-bg)',
      filterKey: 'filter',
      filterVal: 'urgent',
      isActive: filters.filter === 'urgent'
    }
  ];

  const handleCardClick = (card) => {
    if (card.filterKey === 'status') {
      setFilter('filter', 'all');
      setFilter('category_id', 'all');
      setFilter('status', card.filterVal);
    } else {
      setFilter('status', 'all');
      setFilter('category_id', 'all');
      setFilter('filter', card.filterVal);
    }
  };

  return (
    <section className="stats-grid">
      {statCards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            onClick={() => handleCardClick(card)}
            className={`stat-card ${card.isActive ? 'active' : ''}`}
            title={`Filtrar por: ${card.label}`}
          >
            <div
              className="stat-icon"
              style={{ backgroundColor: card.bgColor, color: card.color }}
            >
              <Icon size={24} />
            </div>

            <div className="stat-info">
              <span className="stat-value" style={{ color: card.color }}>
                {card.value}
              </span>
              <span className="stat-label">{card.label}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {card.subValue}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
