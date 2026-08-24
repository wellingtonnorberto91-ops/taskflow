import { randomUUID } from 'crypto';
import { db } from '../config/database.js';

export async function getCategories(req, res, next) {
  try {
    const userId = req.user.id;

    const result = await db.execute({
      sql: `
        SELECT c.*, COUNT(t.id) as task_count
        FROM categories c
        LEFT JOIN tasks t ON t.category_id = c.id AND t.user_id = c.user_id
        WHERE c.user_id = ?
        GROUP BY c.id
        ORDER BY c.name ASC
      `,
      args: [userId]
    });

    res.json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, color = '#6366f1', icon = 'folder' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'O nome da categoria é obrigatório.'
      });
    }

    const categoryId = randomUUID();

    await db.execute({
      sql: `INSERT INTO categories (id, user_id, name, color, icon) VALUES (?, ?, ?, ?, ?)`,
      args: [categoryId, userId, name.trim(), color, icon]
    });

    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso!',
      category: {
        id: categoryId,
        user_id: userId,
        name: name.trim(),
        color,
        icon,
        task_count: 0
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.execute({
      sql: `DELETE FROM categories WHERE id = ? AND user_id = ?`,
      args: [id, userId]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada ou você não tem permissão para excluí-la.'
      });
    }

    res.json({
      success: true,
      message: 'Categoria excluída com sucesso!'
    });
  } catch (error) {
    next(error);
  }
}
