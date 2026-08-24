import React, { useState } from 'react';
import {
  ListTodo,
  Calendar,
  AlertCircle,
  Flame,
  CheckCircle2,
  Folder,
  Plus,
  Tag
} from 'lucide-react';
import { useTasks } from '../context/TaskContext.jsx';

export function Sidebar() {
  const { categories, stats, filters, setFilter, createCategory } = useTasks();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  const navItems = [
    {
      id: 'all',
      label: 'Todas as Tarefas',
      icon: ListTodo,
      badge: stats.total,
      type: 'filter',
      value: 'all'
    },
    {
      id: 'today',
      label: 'Para Hoje',
      icon: Calendar,
      badge: null,
      type: 'filter',
      value: 'today'
    },
    {
      id: 'overdue',
      label: 'Atrasadas',
      icon: AlertCircle,
      badge: stats.overdue > 0 ? stats.overdue : null,
      badgeColor: 'var(--color-danger)',
      type: 'filter',
      value: 'overdue'
    },
    {
      id: 'urgent',
      label: 'Urgentes',
      icon: Flame,
      badge: stats.urgent > 0 ? stats.urgent : null,
      badgeColor: 'var(--priority-high)',
      type: 'filter',
      value: 'urgent'
    },
    {
      id: 'completed',
      label: 'Concluídas',
      icon: CheckCircle2,
      badge: stats.completedTotal,
      type: 'status',
      value: 'completed'
    }
  ];

  const handleNavClick = (item) => {
    if (item.type === 'filter') {
      setFilter('status', 'all');
      setFilter('category_id', 'all');
      setFilter('filter', item.value);
    } else if (item.type === 'status') {
      setFilter('filter', 'all');
      setFilter('category_id', 'all');
      setFilter('status', item.value);
    }
  };

  const handleCategoryClick = (catId) => {
    setFilter('filter', 'all');
    setFilter('status', 'all');
    setFilter('category_id', catId);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await createCategory(newCatName.trim(), newCatColor, 'folder');
    setNewCatName('');
    setIsAddingCategory(false);
  };

  return (
    <aside className="sidebar">
      {/* Navegação Principal */}
      <div className="nav-section">
        <span className="nav-label">Visões</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.type === 'filter'
              ? filters.filter === item.value && filters.status !== 'completed' && filters.category_id === 'all'
              : filters.status === item.value && filters.category_id === 'all';

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-item-content">
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className="nav-badge"
                  style={item.badgeColor ? { backgroundColor: item.badgeColor, color: '#fff' } : {}}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Categorias */}
      <div className="nav-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="nav-label">Categorias</span>
          <button
            onClick={() => setIsAddingCategory(prev => !prev)}
            className="btn-icon"
            style={{ padding: '0.25rem' }}
            title="Adicionar Categoria"
          >
            <Plus size={16} />
          </button>
        </div>

        {isAddingCategory && (
          <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem 0' }}>
            <input
              type="text"
              placeholder="Nome da categoria..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.8125rem', padding: '0.375rem 0.625rem' }}
              autoFocus
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                style={{ width: '32px', height: '28px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                title="Escolha a cor"
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', flex: 1 }}>
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="btn btn-ghost"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {categories.map((cat) => {
          const isActive = filters.category_id === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-item-content">
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: cat.color || '#6366f1',
                    display: 'inline-block'
                  }}
                />
                <span>{cat.name}</span>
              </div>
              {cat.task_count > 0 && (
                <span className="nav-badge">{cat.task_count}</span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
