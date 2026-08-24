import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { taskApi, categoryApi, statsApi } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completedToday: 0,
    overdue: 0,
    urgent: 0,
    completionRate: 0,
    categories: [],
    priorities: []
  });

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category_id: 'all',
    search: '',
    filter: 'all' // 'all' | 'today' | 'overdue' | 'urgent'
  });

  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carrega tarefas com base nos filtros
  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.category_id !== 'all') params.category_id = filters.category_id;
      if (filters.search) params.search = filters.search;
      if (filters.filter !== 'all') params.filter = filters.filter;

      const data = await taskApi.getTasks(params);
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters]);

  // Carrega categorias
  const fetchCategories = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await categoryApi.getCategories();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  }, [isAuthenticated]);

  // Carrega estatísticas do Dashboard
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await statsApi.getStats();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  }, [isAuthenticated]);

  // Atualiza tudo
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchTasks(), fetchCategories(), fetchStats()]);
  }, [fetchTasks, fetchCategories, fetchStats]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    } else {
      setTasks([]);
      setCategories([]);
    }
  }, [isAuthenticated, filters, refreshAll]);

  // Operações de Tarefas
  const createTask = async (taskData) => {
    try {
      const res = await taskApi.createTask(taskData);
      if (res.success) {
        await refreshAll();
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const res = await taskApi.updateTask(id, taskData);
      if (res.success) {
        await refreshAll();
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const toggleTask = async (id) => {
    // Atualização otimista na interface
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              status: t.status === 'completed' ? 'pending' : 'completed',
              completed_at: t.status === 'completed' ? null : new Date().toISOString()
            }
          : t
      )
    );

    try {
      await taskApi.toggleTask(id);
      await fetchStats();
    } catch (err) {
      console.error('Erro ao alternar status da tarefa:', err);
      fetchTasks(); // Reverte em caso de erro
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await taskApi.deleteTask(id);
      if (res.success) {
        setTasks(prev => prev.filter(t => t.id !== id));
        await fetchStats();
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Categorias
  const createCategory = async (name, color, icon) => {
    try {
      const res = await categoryApi.createCategory({ name, color, icon });
      if (res.success) {
        await fetchCategories();
        return { success: true, category: res.category };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      category_id: 'all',
      search: '',
      filter: 'all'
    });
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        stats,
        filters,
        loading,
        editingTask,
        isModalOpen,
        createTask,
        updateTask,
        toggleTask,
        deleteTask,
        createCategory,
        setFilter,
        resetFilters,
        refreshAll,
        openCreateModal,
        openEditModal,
        closeModal
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks deve ser usado dentro de um TaskProvider');
  }
  return context;
}
