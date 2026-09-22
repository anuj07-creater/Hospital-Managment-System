import { Router } from 'express';
import { getPatients, registerPatient, getPatientById } from '../controllers/patientController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

// Only ADMIN, DOCTOR, and RECEPTIONIST can search all patient records
router.get('/', protect, authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'), getPatients);

// RECEPTIONIST and ADMIN register walk-in patients
router.post('/', protect, authorize('ADMIN', 'RECEPTIONIST'), registerPatient);

// View patient by ID or MRN
router.get('/:id', protect, getPatientById);

export default router;
