import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { prescriptionService } from '../services/prescriptionService';
import { doctorService } from '../services/doctorService';
import { patientService } from '../services/patientService';

export async function getPrescriptions(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) return sendError(res, 'Unauthorized', 401);

    const { patientId, doctorId, appointmentId } = req.query;
    const filter: any = {
      patientId: patientId ? String(patientId) : undefined,
      doctorId: doctorId ? String(doctorId) : undefined,
      appointmentId: appointmentId ? String(appointmentId) : undefined,
    };

    if (user.role === 'DOCTOR') {
      const allDocs = await doctorService.getAllDoctors();
      const myDoc = allDocs.find((d: any) => d.userId === user.id || d.email === user.email);
      if (myDoc) {
        filter.doctorId = myDoc.id;
      }
    } else if (user.role === 'PATIENT') {
      const allPats = await patientService.getAllPatients();
      const myPat = allPats.find((p: any) => p.userId === user.id || p.email === user.email);
      if (myPat) {
        filter.patientId = myPat.id;
      }
    }

    const list = await prescriptionService.getAllPrescriptions(filter);
    return sendSuccess(res, list, 'Prescriptions retrieved successfully');
  } catch (error) {
    return sendError(res, 'Failed to fetch prescriptions', 500, (error as Error).message);
  }
}

export async function getPrescriptionById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const item = await prescriptionService.getPrescriptionById(id);
    if (!item) {
      return sendError(res, 'Prescription not found', 404);
    }
    return sendSuccess(res, item, 'Prescription retrieved');
  } catch (error) {
    return sendError(res, 'Failed to fetch prescription', 500, (error as Error).message);
  }
}

export async function createPrescription(req: AuthenticatedRequest, res: Response) {
  try {
    const { patientId, doctorId, appointmentId, diagnosis, medicines, instructions, date } = req.body;

    if (!patientId || !doctorId || !appointmentId || !diagnosis || !Array.isArray(medicines) || medicines.length === 0) {
      return sendError(
        res,
        'patientId, doctorId, appointmentId, diagnosis, and non-empty medicines array are required',
        400
      );
    }

    const created = await prescriptionService.createPrescription({
      patientId,
      doctorId,
      appointmentId,
      diagnosis,
      medicines,
      instructions: instructions || '',
      date: date ? new Date(date) : new Date(),
    });

    return sendSuccess(res, created, 'Prescription created successfully', 201);
  } catch (error) {
    return sendError(res, 'Failed to issue prescription', 500, (error as Error).message);
  }
}
