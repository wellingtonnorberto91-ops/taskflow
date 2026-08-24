import React from 'react';
import { Check, Calendar, Edit2, Trash2, Tag, AlertCircle } from 'lucide-react';
import { useTasks } from '../context/TaskContext.jsx';

export function TaskItem({ task }) {
  const { toggleTask, deleteTask, openEditModal } = useTasks();

  const isCompleted = task.status === 'completed';

  // Formatação de Prioridade
  const priorityConfig = {
    urgent: { label: 'Urgente', class: 'badge-urgent' },
    high: { label: 'Alta', class: 'badge-high' },
    medium: { label: 'Média', class: 'badge-medium' },
    low: { label: 'Baixa', class: 'badge-low' }
  };

  const currentPriority = priorityConfig[task.priority] || priorityConfig.medium;

  // Formatação da Data de Vencimento e Checagem de Atraso
  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;

    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isOverdue = !isCompleted && date < today;

    // Formatação legível em pt-BR
    const formatted = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short'
    }).format(date);

    return {
      formatted,
      isOverdue
    };
  };

  const dueInfo = formatDueDate(task.due_date);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Deseja realmente excluir a tarefa "${task.title}"?`)) {
      deleteTask(task.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    openEditModal(task);
  };

  return (
    <div className={`task-item ${isCompleted ? 'completed' : ''}`}>
      <div className="task-item-left">
        {/* Checkbox de Conclusão */}
        <button
          onClick={() => toggleTask(task.id)}
          className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
          title={isCompleted ? 'Marcar como pendente' : 'Marcar como concluída'}
          aria-label="Alternar conclusão"
        >
          {isCompleted && <Check size={14} strokeWidth={3} />}
        </button>

        <div className="task-details">
          <span className="task-title">{task.title}</span>
          
          {task.description && (
            <p className="task-desc">{task.description}</p>
          )}

          <div className="task-meta">
            {/* Badge de Prioridade */}
            <span className={`badge ${currentPriority.class}`}>
              {currentPriority.label}
            </span>

            {/* Badge de Categoria */}
            {task.category_name && (
              <span className="badge badge-category">
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: task.category_color || 'var(--brand-primary)'
                  }}
                />
                {task.category_name}
              </span>
            )}

            {/* Data de Vencimento */}
            {dueInfo && (
              <span className={`badge badge-date ${dueInfo.isOverdue ? 'overdue' : ''}`}>
                {dueInfo.isOverdue && <AlertCircle size={12} />}
                <Calendar size={12} />
                <span>{dueInfo.formatted}</span>
              </span>
            )}

            {/* Tags associadas */}
            {task.tags && task.tags.map((tag) => (
              <span
                key={tag.id}
                className="badge"
                style={{
                  backgroundColor: 'var(--bg-muted)',
                  color: tag.color || 'var(--text-secondary)',
                  border: '1px solid var(--border)'
                }}
              >
                <Tag size={10} />
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="task-actions">
        <button
          onClick={handleEdit}
          className="btn-icon"
          title="Editar tarefa"
        >
          <Edit2 size={16} />
        </button>

        <button
          onClick={handleDelete}
          className="btn-icon"
          style={{ color: 'var(--color-danger)' }}
          title="Excluir tarefa"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
