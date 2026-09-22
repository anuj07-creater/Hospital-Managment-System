import { Router } from 'express';
import {
  getAppointments,
  getAppointmentById,
  getDoctorAvailability,
  getDoctorSchedule,
  createAppointment,
  checkInAppointment,
  completeAppointment,
  cancelAppointment,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/role';

const router = Router();

// Availability and scheduling endpoints (must be defined before /:id)
router.get('/availability', authenticateToken, getDoctorAvailability);
router.get(
  '/doctor/:doctorId/schedule',
  authenticateToken,
  authorizeRoles('DOCTOR', 'RECEPTIONIST', 'ADMIN'),
  getDoctorSchedule
);

// Standard appointment CRUD
router.get('/', authenticateToken, getAppointments);
router.get('/:id', authenticateToken, getAppointmentById);

// Create appointment (ONLINE for patient, OFFLINE/ONLINE for receptionist & admin)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('PATIENT', 'RECEPTIONIST', 'ADMIN'),
  createAppointment
);

// Specific workflow transition endpoints
router.post(
  '/:id/check-in',
  authenticateToken,
  authorizeRoles('RECEPTIONIST', 'DOCTOR', 'ADMIN'),
  checkInAppointment
);

router.post(
  '/:id/complete',
  authenticateToken,
  authorizeRoles('DOCTOR', 'ADMIN'),
  completeAppointment
);

router.post(
  '/:id/cancel',
  authenticateToken,
  authorizeRoles('PATIENT', 'RECEPTIONIST', 'DOCTOR', 'ADMIN'),
  cancelAppointment
);

// Status updates and modifications
router.patch('/:id/status', authenticateToken, updateAppointmentStatus);
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('RECEPTIONIST', 'DOCTOR', 'ADMIN'),
  updateAppointment
);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteAppointment);

export default router;
