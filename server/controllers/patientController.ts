import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { patientService } from '../services/patientService';

export async function getPatients(req: AuthenticatedRequest, res: Response) {
  try {
    const { search } = req.query;
    const list = await patientService.getAllPatients(search ? String(search) : undefined);
    return sendSuccess(res, list, 'Patients retrieved from database');
  } catch (error) {
    return sendError(res, 'Failed to fetch patients', 500, (error as Error).message);
  }
}

export async function getPatientById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const patient = await patientService.getPatientById(id);

    if (!patient) {
      return sendError(res, 'Patient not found', 404);
    }

    // Role-based privacy: patients can only access their own patient profile
    if (req.user?.role === 'PATIENT') {
      const isOwner =
        patient.userId === req.user.id ||
        (patient.email && patient.email.toLowerCase() === req.user.email?.toLowerCase());

      if (!isOwner) {
        return sendError(
          res,
          'Access forbidden: Patients may only view their own medical record',
          403
        );
      }
    }

    return sendSuccess(res, patient, 'Patient record retrieved');
  } catch (error) {
    return sendError(res, 'Failed to fetch patient', 500, (error as Error).message);
  }
}

export async function registerPatient(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      name,
      email,
      phone,
      bloodGroup,
      age,
      gender,
      address,
      allergies,
      medicalHistory,
      chronicConditions,
      emergencyContact,
    } = req.body;

    if (!name || !phone) {
      return sendError(res, 'Patient name and phone number are required', 400);
    }

    const created = await patientService.createPatient({
      name,
      email,
      phone,
      bloodGroup,
      age: Number(age) || 30,
      gender,
      address,
      allergies: Array.isArray(allergies) ? allergies : allergies ? [allergies] : [],
      medicalHistory: Array.isArray(medicalHistory)
        ? medicalHistory
        : Array.isArray(chronicConditions)
        ? chronicConditions
        : [],
      emergencyContact,
      userId: req.user?.role === 'PATIENT' ? req.user.id : undefined,
    });

    return sendSuccess(res, created, 'Patient registered successfully in RHMS', 201);
  } catch (error) {
    return sendError(res, 'Failed to register patient', 500, (error as Error).message);
  }
}
