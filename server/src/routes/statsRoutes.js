import { Router } from 'express';
import { getDashboardStats } from '../controllers/statsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getDashboardStats);

export default router;
