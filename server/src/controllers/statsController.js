import { db } from '../config/database.js';

export async function getDashboardStats(req, res, next) {
  try {
    const userId = req.user.id;

    // 1. Contagens principais
    const totalQuery = await db.execute({
      sql: `SELECT COUNT(*) as count FROM tasks WHERE user_id = ?`,
      args: [userId]
    });

    const pendingQuery = await db.execute({
      sql: `SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status != 'completed'`,
      args: [userId]
    });

    const completedTodayQuery = await db.execute({
      sql: `
        SELECT COUNT(*) as count 
        FROM tasks 
        WHERE user_id = ? 
          AND status = 'completed' 
          AND date(completed_at) = date('now', 'localtime')
      `,
      args: [userId]
    });

    const overdueQuery = await db.execute({
      sql: `
        SELECT COUNT(*) as count 
        FROM tasks 
        WHERE user_id = ? 
          AND status != 'completed' 
          AND due_date IS NOT NULL 
          AND date(due_date) < date('now', 'localtime')
      `,
      args: [userId]
    });

    const urgentQuery = await db.execute({
      sql: `
        SELECT COUNT(*) as count 
        FROM tasks 
        WHERE user_id = ? 
          AND status != 'completed' 
          AND priority IN ('urgent', 'high')
      `,
      args: [userId]
    });

    const completedTotalQuery = await db.execute({
      sql: `SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'completed'`,
      args: [userId]
    });

    // 2. Tarefas por Categoria
    const categoriesStats = await db.execute({
      sql: `
        SELECT 
          c.id,
          c.name,
          c.color,
          COUNT(t.id) as total_tasks,
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
        FROM categories c
        LEFT JOIN tasks t ON t.category_id = c.id AND t.user_id = c.user_id
        WHERE c.user_id = ?
        GROUP BY c.id
      `,
      args: [userId]
    });

    // 3. Tarefas por Prioridade (somente pendentes)
    const priorityStats = await db.execute({
      sql: `
        SELECT priority, COUNT(*) as count
        FROM tasks
        WHERE user_id = ? AND status != 'completed'
        GROUP BY priority
      `,
      args: [userId]
    });

    const total = Number(totalQuery.rows[0]?.count || 0);
    const pending = Number(pendingQuery.rows[0]?.count || 0);
    const completedToday = Number(completedTodayQuery.rows[0]?.count || 0);
    const overdue = Number(overdueQuery.rows[0]?.count || 0);
    const urgent = Number(urgentQuery.rows[0]?.count || 0);
    const completedTotal = Number(completedTotalQuery.rows[0]?.count || 0);

    const completionRate = total > 0 ? Math.round((completedTotal / total) * 100) : 0;

    res.json({
      success: true,
      stats: {
        total,
        pending,
        completedTotal,
        completedToday,
        overdue,
        urgent,
        completionRate,
        categories: categoriesStats.rows,
        priorities: priorityStats.rows
      }
    });
  } catch (error) {
    next(error);
  }
}
