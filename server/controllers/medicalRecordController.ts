import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { medicalRecordService } from '../services/medicalRecordService';
import { doctorService } from '../services/doctorService';
import { patientService } from '../services/patientService';

export async function getMedicalRecords(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) return sendError(res, 'Unauthorized', 401);

    const { patientId, doctorId } = req.query;
    const filter: any = {
      patientId: patientId ? String(patientId) : undefined,
      doctorId: doctorId ? String(doctorId) : undefined,
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

    const list = await medicalRecordService.getAllMedicalRecords(filter);
    return sendSuccess(res, list, 'Medical records retrieved from database');
  } catch (error) {
    return sendError(res, 'Failed to fetch medical records', 500, (error as Error).message);
  }
}

export async function getMedicalRecordById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const record = await medicalRecordService.getMedicalRecordById(id);
    if (!record) {
      return sendError(res, 'Medical record not found', 404);
    }
    return sendSuccess(res, record, 'Medical record retrieved');
  } catch (error) {
    return sendError(res, 'Failed to fetch medical record', 500, (error as Error).message);
  }
}

export async function createMedicalRecord(req: AuthenticatedRequest, res: Response) {
  try {
    const { patientId, doctorId, appointmentId, diagnosis, notes, date, attachments } = req.body;

    if (!patientId || !doctorId || !diagnosis) {
      return sendError(res, 'patientId, doctorId, and diagnosis are required fields', 400);
    }

    const created = await medicalRecordService.createMedicalRecord({
      patientId,
      doctorId,
      appointmentId,
      diagnosis,
      notes: notes || '',
      date: date ? new Date(date) : new Date(),
      attachments: attachments || [],
    });

    return sendSuccess(res, created, 'Medical record entered successfully', 201);
  } catch (error) {
    return sendError(res, 'Failed to record medical entry', 500, (error as Error).message);
  }
}
