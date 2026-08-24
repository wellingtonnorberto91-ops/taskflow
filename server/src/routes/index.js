import { Router } from 'express';
import authRoutes from './authRoutes.js';
import taskRoutes from './taskRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import statsRoutes from './statsRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/categories', categoryRoutes);
router.use('/stats', statsRoutes);

// Healthcheck
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'TaskFlow API'
  });
});

export default router;
