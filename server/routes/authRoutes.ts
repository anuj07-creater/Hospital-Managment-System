import { Router } from 'express';
import { login, register, logout, getMe, getProfile, demoLogin } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/demo-login', demoLogin);

// Protected auth endpoints
router.get('/me', protect, getMe);
router.get('/profile', protect, getProfile);

export default router;
