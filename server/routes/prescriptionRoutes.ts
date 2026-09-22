import { Router } from 'express';
import {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
} from '../controllers/prescriptionController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

// Retrieve prescriptions (filtered by user role/patientId)
router.get('/', protect, getPrescriptions);
router.get('/:id', protect, getPrescriptionById);

// Issue prescription (Doctors and Admins only)
router.post('/', protect, authorize('ADMIN', 'DOCTOR'), createPrescription);

export default router;
