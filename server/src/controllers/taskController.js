import { randomUUID } from 'crypto';
import { db } from '../config/database.js';

export async function getTasks(req, res, next) {
  try {
    const userId = req.user.id;
    const { status, priority, category_id, search, filter } = req.query;

    let query = `
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        GROUP_CONCAT(DISTINCT tg.name) as tag_names,
        GROUP_CONCAT(DISTINCT tg.id) as tag_ids,
        GROUP_CONCAT(DISTINCT tg.color) as tag_colors
      FROM tasks t
      LEFT JOIN categories c ON c.id = t.category_id
      LEFT JOIN task_tags tt ON tt.task_id = t.id
      LEFT JOIN tags tg ON tg.id = tt.tag_id
      WHERE t.user_id = ?
    `;

    const args = [userId];

    if (status && status !== 'all') {
      query += ` AND t.status = ?`;
      args.push(status);
    }

    if (priority && priority !== 'all') {
      query += ` AND t.priority = ?`;
      args.push(priority);
    }

    if (category_id && category_id !== 'all') {
      query += ` AND t.category_id = ?`;
      args.push(category_id);
    }

    if (search && search.trim()) {
      query += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
      const term = `%${search.trim()}%`;
      args.push(term, term);
    }

    // Filtros temporais rápidos
    if (filter === 'today') {
      query += ` AND date(t.due_date) = date('now', 'localtime')`;
    } else if (filter === 'overdue') {
      query += ` AND t.status != 'completed' AND t.due_date IS NOT NULL AND date(t.due_date) < date('now', 'localtime')`;
    } else if (filter === 'urgent') {
      query += ` AND t.status != 'completed' AND t.priority IN ('urgent', 'high')`;
    }

    query += `
      GROUP BY t.id
      ORDER BY 
        CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END ASC,
        CASE WHEN t.priority = 'urgent' THEN 1 
             WHEN t.priority = 'high' THEN 2 
             WHEN t.priority = 'medium' THEN 3 
             ELSE 4 END ASC,
        t.due_date ASC NULLS LAST,
        t.created_at DESC
    `;

    const result = await db.execute({ sql: query, args });

    // Formata as tags associadas a cada tarefa
    const tasks = result.rows.map(row => {
      const tags = [];
      if (row.tag_ids && row.tag_names) {
        const ids = String(row.tag_ids).split(',');
        const names = String(row.tag_names).split(',');
        const colors = row.tag_colors ? String(row.tag_colors).split(',') : [];

        for (let i = 0; i < ids.length; i++) {
          tags.push({
            id: ids[i],
            name: names[i],
            color: colors[i] || '#64748b'
          });
        }
      }

      return {
        id: row.id,
        user_id: row.user_id,
        category_id: row.category_id,
        category_name: row.category_name,
        category_color: row.category_color,
        category_icon: row.category_icon,
        title: row.title,
        description: row.description,
        priority: row.priority,
        status: row.status,
        due_date: row.due_date,
        completed_at: row.completed_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        tags
      };
    });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.execute({
      sql: `
        SELECT 
          t.*,
          c.name as category_name,
          c.color as category_color,
          c.icon as category_icon
        FROM tasks t
        LEFT JOIN categories c ON c.id = t.category_id
        WHERE t.id = ? AND t.user_id = ?
      `,
      args: [id, userId]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada.'
      });
    }

    const task = result.rows[0];

    // Busca tags associadas
    const tagsResult = await db.execute({
      sql: `
        SELECT tg.* 
        FROM tags tg
        JOIN task_tags tt ON tt.tag_id = tg.id
        WHERE tt.task_id = ?
      `,
      args: [id]
    });

    task.tags = tagsResult.rows;

    res.json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      title,
      description = '',
      priority = 'medium',
      category_id = null,
      due_date = null,
      tags = []
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'O título da tarefa é obrigatório.'
      });
    }

    const taskId = randomUUID();
    const validPriority = ['low', 'medium', 'high', 'urgent'].includes(priority) ? priority : 'medium';

    await db.execute({
      sql: `
        INSERT INTO tasks (id, user_id, category_id, title, description, priority, status, due_date)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
      `,
      args: [
        taskId,
        userId,
        category_id || null,
        title.trim(),
        description ? description.trim() : '',
        validPriority,
        due_date || null
      ]
    });

    // Associa ou cria tags se fornecidas
    if (Array.isArray(tags) && tags.length > 0) {
      for (const tagItem of tags) {
        let tagId = tagItem.id;

        // Se for uma tag nova (nome fornecido sem ID)
        if (!tagId && tagItem.name) {
          tagId = randomUUID();
          await db.execute({
            sql: `INSERT INTO tags (id, user_id, name, color) VALUES (?, ?, ?, ?)`,
            args: [tagId, userId, tagItem.name.trim(), tagItem.color || '#6366f1']
          });
        }

        if (tagId) {
          await db.execute({
            sql: `INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)`,
            args: [taskId, tagId]
          });
        }
      }
    }

    // Retorna a tarefa completa criada
    const createdTask = await db.execute({
      sql: `
        SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
        FROM tasks t
        LEFT JOIN categories c ON c.id = t.category_id
        WHERE t.id = ?
      `,
      args: [taskId]
    });

    res.status(201).json({
      success: true,
      message: 'Tarefa criada com sucesso!',
      task: {
        ...createdTask.rows[0],
        tags: tags || []
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      title,
      description,
      priority,
      status,
      category_id,
      due_date,
      tags
    } = req.body;

    const existing = await db.execute({
      sql: `SELECT id, status FROM tasks WHERE id = ? AND user_id = ?`,
      args: [id, userId]
    });

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada.'
      });
    }

    let completedAtUpdate = '';
    const updateArgs = [];
    const fields = [];

    if (title !== undefined) {
      fields.push('title = ?');
      updateArgs.push(title.trim());
    }

    if (description !== undefined) {
      fields.push('description = ?');
      updateArgs.push(description ? description.trim() : '');
    }

    if (priority !== undefined && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      fields.push('priority = ?');
      updateArgs.push(priority);
    }

    if (status !== undefined && ['pending', 'in_progress', 'completed'].includes(status)) {
      fields.push('status = ?');
      updateArgs.push(status);
      if (status === 'completed') {
        fields.push('completed_at = CURRENT_TIMESTAMP');
      } else {
        fields.push('completed_at = NULL');
      }
    }

    if (category_id !== undefined) {
      fields.push('category_id = ?');
      updateArgs.push(category_id || null);
    }

    if (due_date !== undefined) {
      fields.push('due_date = ?');
      updateArgs.push(due_date || null);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    if (fields.length > 1) {
      const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
      updateArgs.push(id, userId);
      await db.execute({ sql, args: updateArgs });
    }

    // Atualiza tags se informadas
    if (Array.isArray(tags)) {
      await db.execute({
        sql: `DELETE FROM task_tags WHERE task_id = ?`,
        args: [id]
      });

      for (const tagItem of tags) {
        let tagId = tagItem.id;
        if (!tagId && tagItem.name) {
          tagId = randomUUID();
          await db.execute({
            sql: `INSERT INTO tags (id, user_id, name, color) VALUES (?, ?, ?, ?)`,
            args: [tagId, userId, tagItem.name.trim(), tagItem.color || '#6366f1']
          });
        }
        if (tagId) {
          await db.execute({
            sql: `INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)`,
            args: [id, tagId]
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Tarefa atualizada com sucesso!'
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleTaskStatus(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.execute({
      sql: `SELECT id, status FROM tasks WHERE id = ? AND user_id = ?`,
      args: [id, userId]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada.'
      });
    }

    const currentStatus = result.rows[0].status;
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const completedAt = nextStatus === 'completed' ? new Date().toISOString() : null;

    await db.execute({
      sql: `
        UPDATE tasks 
        SET status = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ?
      `,
      args: [nextStatus, completedAt, id, userId]
    });

    res.json({
      success: true,
      message: nextStatus === 'completed' ? 'Tarefa concluída!' : 'Tarefa reaberta!',
      status: nextStatus,
      completed_at: completedAt
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.execute({
      sql: `DELETE FROM tasks WHERE id = ? AND user_id = ?`,
      args: [id, userId]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada ou você não tem permissão para excluí-la.'
      });
    }

    res.json({
      success: true,
      message: 'Tarefa excluída com sucesso!'
    });
  } catch (error) {
    next(error);
  }
}
