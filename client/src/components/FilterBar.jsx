import React from 'react';
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useTasks } from '../context/TaskContext.jsx';

export function FilterBar() {
  const { filters, setFilter, resetFilters, categories } = useTasks();

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category_id !== 'all' ||
    filters.search !== '' ||
    filters.filter !== 'all';

  return (
    <div className="filter-bar">
      <div className="filter-left">
        {/* Barra de Busca */}
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="search-input"
          />
          {filters.search && (
            <button
              onClick={() => setFilter('search', '')}
              style={{ position: 'absolute', right: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)' }}
              title="Limpar busca"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtro de Categoria */}
        <select
          value={filters.category_id}
          onChange={(e) => setFilter('category_id', e.target.value)}
          className="select-filter"
        >
          <option value="all">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Filtro de Prioridade */}
        <select
          value={filters.priority}
          onChange={(e) => setFilter('priority', e.target.value)}
          className="select-filter"
        >
          <option value="all">Todas as prioridades</option>
          <option value="urgent">Urgente</option>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>
      </div>

      <div className="filter-right">
        {/* Abas de Status */}
        <div className="tabs-status">
          <button
            onClick={() => setFilter('status', 'all')}
            className={`tab-btn ${filters.status === 'all' ? 'active' : ''}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('status', 'pending')}
            className={`tab-btn ${filters.status === 'pending' ? 'active' : ''}`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter('status', 'completed')}
            className={`tab-btn ${filters.status === 'completed' ? 'active' : ''}`}
          >
            Concluídas
          </button>
        </div>

        {/* Botão Resetar Filtros */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="btn btn-ghost"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
            title="Redefinir todos os filtros"
          >
            <RotateCcw size={14} />
            <span>Limpar</span>
          </button>
        )}
      </div>
    </div>
  );
}
