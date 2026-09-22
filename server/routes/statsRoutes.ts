import { Router } from 'express';
import { getDashboardStats, getAdminAnalytics } from '../controllers/statsController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

// Dashboard summary metrics for logged-in user role
router.get('/dashboard', protect, getDashboardStats);

// Strictly Admin-only analytics and reports
router.get('/admin', protect, authorize('ADMIN'), getAdminAnalytics);

export default router;
