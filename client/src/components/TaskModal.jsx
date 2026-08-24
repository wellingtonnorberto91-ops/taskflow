import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, AlertCircle, Save } from 'lucide-react';
import { useTasks } from '../context/TaskContext.jsx';

export function TaskModal() {
  const { isModalOpen, closeModal, editingTask, createTask, updateTask, categories } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'medium');
      setCategoryId(editingTask.category_id || '');
      setDueDate(editingTask.due_date || '');
      setTagsInput(
        editingTask.tags ? editingTask.tags.map(t => t.name).join(', ') : ''
      );
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategoryId('');
      setDueDate('');
      setTagsInput('');
    }
    setError(null);
  }, [editingTask, isModalOpen]);

  if (!isModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe o título da tarefa.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Converte a string de tags em array de objetos
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
        .map(name => ({ name }));

      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        category_id: categoryId || null,
        due_date: dueDate || null,
        tags
      };

      let res;
      if (editingTask) {
        res = await updateTask(editingTask.id, payload);
      } else {
        res = await createTask(payload);
      }

      if (res.success) {
        closeModal();
      } else {
        setError(res.message || 'Falha ao salvar a tarefa.');
      }
    } catch (err) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="modal-header">
          <h3 className="modal-title">
            {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h3>
          <button onClick={closeModal} className="btn-icon" title="Fechar modal">
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Título */}
            <div className="form-group">
              <label className="form-label">Título da Tarefa *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Finalizar proposta de arquitetura..."
                className="form-input"
                autoFocus
              />
            </div>

            {/* Descrição */}
            <div className="form-group">
              <label className="form-label">Descrição / Anotações</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione detalhes, critérios de aceitação ou links úteis..."
                className="form-textarea"
              />
            </div>

            {/* Categoria e Prioridade */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="form-select"
                >
                  <option value="">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Prioridade</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="form-select"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            {/* Data e Tags */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Data de Vencimento</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="backend, api, bug"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={closeModal}
              className="btn btn-ghost"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Tarefa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
