import { Router } from 'express';
import { getDoctors, getDoctorById, createDoctor } from '../controllers/doctorController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

// Doctors directory (viewable by authenticated users)
router.get('/', protect, getDoctors);
router.get('/:id', protect, getDoctorById);

// Admin doctor creation
router.post('/', protect, authorize('ADMIN'), createDoctor);

export default router;
