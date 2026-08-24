import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

export const db = createClient({
  url: process.env.DATABASE_URL || 'file:./taskflow.db'
});

export async function initDatabase() {
  await db.execute('PRAGMA foreign_keys = ON;');

  // 1. Tabela de Usuários
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Tabela de Categorias
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6366f1',
      icon TEXT DEFAULT 'folder',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 3. Tabela de Tarefas
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
      status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
      due_date TEXT,
      completed_at TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);

  // 4. Tabela de Tags
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#64748b',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 5. Tabela de Relacionamento Tarefa <-> Tags
  await db.execute(`
    CREATE TABLE IF NOT EXISTS task_tags (
      task_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (task_id, tag_id),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `);

  // Índices para otimização
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON tasks(user_id, due_date);`);

  console.log('✅ Banco de dados SQLite inicializado com sucesso.');
}

/**
 * Cria categorias padrão para novos usuários
 */
export async function seedUserDefaultCategories(userId) {
  const defaultCategories = [
    { name: 'Trabalho', color: '#3b82f6', icon: 'briefcase' },
    { name: 'Pessoal', color: '#10b981', icon: 'user' },
    { name: 'Estudos', color: '#8b5cf6', icon: 'book-open' }
  ];

  for (const cat of defaultCategories) {
    const id = randomUUID();
    await db.execute({
      sql: `INSERT INTO categories (id, user_id, name, color, icon) VALUES (?, ?, ?, ?, ?)`,
      args: [id, userId, cat.name, cat.color, cat.icon]
    });
  }
}
