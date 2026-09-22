import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { isMongoConnected } from '../config/db';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { Appointment } from '../models/Appointment';
import { hospitalStore } from '../services/storeService';
import { doctorService } from '../services/doctorService';
import { patientService } from '../services/patientService';

export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    const role = req.user?.role || 'PATIENT';

    let totalDoctors = hospitalStore.doctors.length;
    let totalPatients = hospitalStore.patients.length;
    let totalAppointments = hospitalStore.appointments.length;
    let activeAppointments = 0;

    if (isMongoConnected()) {
      totalDoctors = await Doctor.countDocuments();
      totalPatients = await Patient.countDocuments();
      totalAppointments = await Appointment.countDocuments();
      activeAppointments = await Appointment.countDocuments({
        status: { $in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      });
    } else {
      activeAppointments = hospitalStore.appointments.filter(
        (a) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS' || a.status === 'PENDING'
      ).length;
    }

    let roleSpecificStats: any = {};

    if (role === 'ADMIN') {
      roleSpecificStats = {
        totalDoctors,
        totalPatients,
        totalAppointments,
        activeAppointments,
        bedOccupancyRate: '78%',
        dailyRevenueINR: 54800,
        departmentsCount: 8,
        activeStaffCount: 42,
        chartData: [
          { day: 'Mon', outpatient: 45, online: 12 },
          { day: 'Tue', outpatient: 52, online: 18 },
          { day: 'Wed', outpatient: 48, online: 15 },
          { day: 'Thu', outpatient: 61, online: 22 },
          { day: 'Fri', outpatient: 58, online: 19 },
          { day: 'Sat', outpatient: 70, online: 28 },
          { day: 'Sun', outpatient: 25, online: 8 },
        ],
      };
    } else if (role === 'DOCTOR') {
      const allDocs = await doctorService.getAllDoctors();
      const doc = allDocs.find((d: any) => d.userId === req.user?.id || d.email === req.user?.email) || allDocs[0];
      
      let myAppointments: any[] = [];
      if (isMongoConnected() && doc) {
        myAppointments = await Appointment.find({ doctorId: doc.id })
          .populate({ path: 'patientId', populate: { path: 'userId' } })
          .lean();
      } else {
        myAppointments = hospitalStore.appointments.filter((a) => a.doctorId === doc?.id);
      }

      roleSpecificStats = {
        doctorName: doc?.name || 'Dr. Specialist',
        specialization: doc?.specialization || 'Cardiology',
        todayConsultations: myAppointments.length,
        inWaitingQueue: myAppointments.filter((a: any) => a.status === 'CONFIRMED' || a.status === 'CHECKED_IN').length,
        completedToday: myAppointments.filter((a: any) => a.status === 'COMPLETED').length,
        nextPatient: myAppointments.find((a: any) => a.status === 'CONFIRMED' || a.status === 'CHECKED_IN'),
      };
    } else if (role === 'RECEPTIONIST') {
      const allDocs = await doctorService.getAllDoctors();
      roleSpecificStats = {
        walkInsToday: 18,
        registeredPatientsTotal: totalPatients,
        availableDoctorsCount: allDocs.filter((d: any) => d.isAvailable).length,
        pendingConfirmations: isMongoConnected()
          ? await Appointment.countDocuments({ status: 'PENDING' })
          : hospitalStore.appointments.filter((a) => a.status === 'PENDING').length,
      };
    } else if (role === 'PATIENT') {
      const allPats = await patientService.getAllPatients();
      const patient = allPats.find((p: any) => p.userId === req.user?.id || p.email === req.user?.email) || allPats[0];

      let myAppointments: any[] = [];
      if (isMongoConnected() && patient) {
        myAppointments = await Appointment.find({ patientId: patient.id }).lean();
      } else {
        myAppointments = hospitalStore.appointments.filter((a) => a.patientId === patient?.id);
      }

      roleSpecificStats = {
        patientName: patient?.name || 'Valued Patient',
        medicalRecordNumber: patient?.medicalRecordNumber || 'MRN-2026-0042',
        bloodGroup: patient?.bloodGroup || 'B+',
        allergiesCount: patient?.allergies?.length || 0,
        upcomingConsultationsCount: myAppointments.filter((a: any) => a.status === 'CONFIRMED' || a.status === 'PENDING').length,
      };
    }

    return sendSuccess(
      res,
      {
        role,
        stats: roleSpecificStats,
        ...roleSpecificStats,
      },
      'Dashboard analytics retrieved'
    );
  } catch (error) {
    return sendError(res, 'Failed to generate dashboard analytics', 500, (error as Error).message);
  }
}

export async function getAdminAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    let totalDoctors = 0;
    let totalPatients = 0;
    let totalAppointments = 0;

    if (isMongoConnected()) {
      totalDoctors = await Doctor.countDocuments();
      totalPatients = await Patient.countDocuments();
      totalAppointments = await Appointment.countDocuments();
    } else {
      totalDoctors = hospitalStore.doctors.length;
      totalPatients = hospitalStore.patients.length;
      totalAppointments = hospitalStore.appointments.length;
    }

    return sendSuccess(
      res,
      {
        totalDoctors,
        totalPatients,
        totalAppointments,
        systemAudit: {
          database: 'MongoDB Atlas',
          status: 'HEALTHY',
          complianceLevel: 'NABH Level 3 Certified',
        },
      },
      'Administrative system audit analytics'
    );
  } catch (error) {
    return sendError(res, 'Failed to retrieve administrative analytics', 500, (error as Error).message);
  }
}

export async function getPublicHospitalStats(req: Request, res: Response) {
  try {
    let totalDoctors = hospitalStore.doctors.length;
    let totalPatients = hospitalStore.patients.length;
    let totalAppointments = hospitalStore.appointments.length;

    if (isMongoConnected()) {
      totalDoctors = await Doctor.countDocuments();
      totalPatients = await Patient.countDocuments();
      totalAppointments = await Appointment.countDocuments();
    }

    return sendSuccess(
      res,
      {
        totalDoctors,
        totalPatients,
        totalAppointments,
        departmentsCount: 8,
        activeBedCount: 120,
        patientSatisfaction: '98.6%',
        isDemoSystem: true,
      },
      'Public hospital statistics retrieved'
    );
  } catch (error) {
    return sendError(res, 'Failed to fetch public statistics', 500, (error as Error).message);
  }
}
