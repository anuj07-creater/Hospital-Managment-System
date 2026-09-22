import { Router } from 'express';
import authRoutes from './authRoutes';
import doctorRoutes from './doctorRoutes';
import patientRoutes from './patientRoutes';
import appointmentRoutes from './appointmentRoutes';
import prescriptionRoutes from './prescriptionRoutes';
import medicalRecordRoutes from './medicalRecordRoutes';
import statsRoutes from './statsRoutes';
import { isMongoConnected } from '../config/db';

const apiRouter = Router();

// Health & System Status Check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Raut Hospital Management System (RHMS)',
    version: '1.2.0-production-mongoose',
    database: {
      type: 'MongoDB Atlas',
      connected: isMongoConnected(),
      readyState: isMongoConnected() ? 'connected' : 'connecting_or_fallback',
    },
    timestamp: new Date().toISOString(),
  });
});

// Modular Domain Routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/doctors', doctorRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/prescriptions', prescriptionRoutes);
apiRouter.use('/medical-records', medicalRecordRoutes);
apiRouter.use('/stats', statsRoutes);

export default apiRouter;
