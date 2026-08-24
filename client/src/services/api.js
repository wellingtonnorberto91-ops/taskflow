const API_BASE_URL = '/api';

export const authStorage = {
  getToken: () => localStorage.getItem('taskflow_token'),
  setToken: (token) => localStorage.setItem('taskflow_token', token),
  removeToken: () => localStorage.removeItem('taskflow_token')
};

export async function apiFetch(endpoint, options = {}) {
  const token = authStorage.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Erro ${response.status}: Falha na requisição`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status === 401) {
      // Se o token for inválido, limpa e redireciona se necessário
      authStorage.removeToken();
    }
    throw error;
  }
}

export const authApi = {
  login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => apiFetch('/auth/me')
};

export const taskApi = {
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiFetch(`/tasks${queryString}`);
  },
  getTaskById: (id) => apiFetch(`/tasks/${id}`),
  createTask: (taskData) => apiFetch('/tasks', { method: 'POST', body: JSON.stringify(taskData) }),
  updateTask: (id, taskData) => apiFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(taskData) }),
  toggleTask: (id) => apiFetch(`/tasks/${id}/toggle`, { method: 'PATCH' }),
  deleteTask: (id) => apiFetch(`/tasks/${id}`, { method: 'DELETE' })
};

export const categoryApi = {
  getCategories: () => apiFetch('/categories'),
  createCategory: (catData) => apiFetch('/categories', { method: 'POST', body: JSON.stringify(catData) }),
  deleteCategory: (id) => apiFetch(`/categories/${id}`, { method: 'DELETE' })
};

export const statsApi = {
  getStats: () => apiFetch('/stats')
};
