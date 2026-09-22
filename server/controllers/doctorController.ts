import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { doctorService } from '../services/doctorService';

export async function getDoctors(req: Request, res: Response) {
  try {
    const { department, status, availableOnly } = req.query;
    const list = await doctorService.getAllDoctors({
      department: department ? String(department) : undefined,
      status: status ? String(status) : undefined,
      availableOnly: availableOnly === 'true',
    });

    return sendSuccess(res, list, 'Doctor directory retrieved from database');
  } catch (error) {
    return sendError(res, 'Failed to fetch doctors', 500, (error as Error).message);
  }
}

export async function getDoctorById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const doctor = await doctorService.getDoctorById(id);

    if (!doctor) {
      return sendError(res, 'Doctor not found', 404);
    }

    return sendSuccess(res, doctor, 'Doctor profile retrieved');
  } catch (error) {
    return sendError(res, 'Failed to fetch doctor', 500, (error as Error).message);
  }
}

export async function createDoctor(req: Request, res: Response) {
  try {
    const {
      userId,
      specialization,
      department,
      qualification,
      experience,
      consultationFee,
      availability,
      roomNumber,
      status,
    } = req.body;

    if (!userId || !specialization || !qualification || consultationFee === undefined) {
      return sendError(
        res,
        'Please provide userId, specialization, qualification, and consultationFee',
        400
      );
    }

    const doctor = await doctorService.createDoctor({
      userId,
      specialization,
      department,
      qualification,
      experience: Number(experience) || 1,
      consultationFee: Number(consultationFee),
      availability,
      roomNumber,
      status: status || 'AVAILABLE',
    });

    return sendSuccess(res, doctor, 'Doctor profile created successfully', 201);
  } catch (error) {
    return sendError(res, 'Failed to create doctor profile', 500, (error as Error).message);
  }
}
