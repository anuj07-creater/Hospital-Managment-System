import { Router } from 'express';
import {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
} from '../controllers/medicalRecordController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

// Retrieve medical records (filtered by user role/patientId)
router.get('/', protect, getMedicalRecords);
router.get('/:id', protect, getMedicalRecordById);

// Enter medical record (Doctors and Admins only)
router.post('/', protect, authorize('ADMIN', 'DOCTOR'), createMedicalRecord);

export default router;
