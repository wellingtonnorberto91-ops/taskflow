import React, { useState } from 'react';
import { Plus, Calendar, Tag, AlertCircle } from 'lucide-react';
import { useTasks } from '../context/TaskContext.jsx';

export function QuickAddTask() {
  const { createTask, categories } = useTasks();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await createTask({
        title: title.trim(),
        priority,
        category_id: categoryId || null,
        due_date: dueDate || null
      });

      setTitle('');
      setDueDate('');
      setPriority('medium');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="quick-add-card">
      <Plus size={20} color="var(--brand-primary)" />
      
      <input
        type="text"
        placeholder="Adicionar nova tarefa rapidamente... (Pressione Enter)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="quick-add-input"
        disabled={isSubmitting}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Categoria */}
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="select-filter"
          style={{ padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
          title="Categoria"
        >
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Prioridade */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="select-filter"
          style={{ padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
          title="Prioridade"
        >
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>

        {/* Data de Vencimento */}
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="select-filter"
          style={{ padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
          title="Data de Entrega"
        />

        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="btn btn-primary"
          style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }}
        >
          <span>Adicionar</span>
        </button>
      </div>
    </form>
  );
}
