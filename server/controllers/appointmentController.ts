import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { appointmentService } from '../services/appointmentService';
import { doctorService } from '../services/doctorService';
import { patientService } from '../services/patientService';

export async function getAppointments(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) return sendError(res, 'Unauthorized', 401);

    const { status, date, doctorId, patientId, type } = req.query;
    const filter: any = {
      status: status ? String(status) : undefined,
      date: date ? String(date) : undefined,
      doctorId: doctorId ? String(doctorId) : undefined,
      patientId: patientId ? String(patientId) : undefined,
      type: type ? String(type) : undefined,
    };

    // Role-filtered appointments
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
      } else {
        // Patient has no profile yet, return empty list
        return sendSuccess(res, [], 'Appointments retrieved');
      }
    }

    const list = await appointmentService.getAllAppointments(filter);
    return sendSuccess(res, list, 'Appointments retrieved from database');
  } catch (error) {
    return sendError(res, 'Failed to fetch appointments', 500, (error as Error).message);
  }
}

export async function getAppointmentById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.getAppointmentById(id);
    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }

    // Role privacy check: patients can only view their own appointments
    if (req.user?.role === 'PATIENT') {
      const allPats = await patientService.getAllPatients();
      const myPat = allPats.find((p: any) => p.userId === req.user?.id || p.email === req.user?.email);
      if (!myPat || appointment.patientId !== myPat.id) {
        return sendError(res, 'Access forbidden: You cannot view other patients appointments', 403);
      }
    }

    return sendSuccess(res, appointment, 'Appointment retrieved');
  } catch (error) {
    return sendError(res, 'Failed to fetch appointment', 500, (error as Error).message);
  }
}

/**
 * Public/Unified availability endpoint for patients and receptionists.
 * Returns configured consultation slots and their availability status (AVAILABLE, ONLINE, OFFLINE).
 * Omits private patient identifiers.
 */
export async function getDoctorAvailability(req: AuthenticatedRequest, res: Response) {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return sendError(res, 'Both doctorId and date (YYYY-MM-DD) query parameters are required', 400);
    }

    const result = await appointmentService.getDoctorAvailability(String(doctorId), String(date));
    return sendSuccess(res, result, 'Doctor availability slots retrieved');
  } catch (error) {
    return sendError(res, 'Failed to fetch doctor availability', 500, (error as Error).message);
  }
}

/**
 * Comprehensive Doctor Schedule with Patient details.
 * Restricted to RECEPTIONIST, DOCTOR, and ADMIN.
 */
export async function getDoctorSchedule(req: AuthenticatedRequest, res: Response) {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!doctorId || !date) {
      return sendError(res, 'Both doctorId parameter and date (YYYY-MM-DD) query parameter are required', 400);
    }

    const result = await appointmentService.getDoctorSchedule(String(doctorId), String(date));
    return sendSuccess(res, result, 'Doctor clinic schedule roster retrieved');
  } catch (error) {
    return sendError(res, 'Failed to fetch doctor schedule', 500, (error as Error).message);
  }
}

/**
 * Schedule an appointment (ONLINE or OFFLINE).
 * Strictly prevents double-booking across the unified schedule.
 */
export async function createAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) return sendError(res, 'Unauthorized', 401);

    const {
      doctorId,
      patientId,
      appointmentDate,
      timeSlot,
      appointmentTime,
      type,
      symptoms,
      reason,
      notes,
    } = req.body;

    const reasonText = (reason || symptoms || '').trim();
    const rawTime = appointmentTime || timeSlot;

    if (!doctorId || !appointmentDate || !rawTime || !reasonText) {
      return sendError(
        res,
        'Doctor, appointment date, appointment time/slot, and reason/symptoms are required',
        400
      );
    }

    // Role-specific patient resolution and authorization:
    let finalPatientId = patientId;

    if (user.role === 'PATIENT') {
      const allPats = await patientService.getAllPatients();
      const myPat = allPats.find((p: any) => p.userId === user.id || p.email === user.email);

      if (!myPat) {
        return sendError(res, 'Patient medical profile not found. Please contact administration.', 400);
      }

      // Security check (TEST 5): Patient cannot book on behalf of another patient ID
      if (patientId && patientId !== myPat.id) {
        return sendError(
          res,
          'Access forbidden: Patients may only book appointments for themselves',
          403
        );
      }

      finalPatientId = myPat.id;
    } else {
      // RECEPTIONIST or ADMIN must specify or have a valid patient
      if (!finalPatientId) {
        return sendError(res, 'Patient ID is required for staff booking. Please select or register a patient.', 400);
      }
    }

    // Default type: PATIENTS default to ONLINE, staff default to OFFLINE
    const finalType: 'ONLINE' | 'OFFLINE' =
      type === 'ONLINE' || type === 'OFFLINE'
        ? type
        : user.role === 'PATIENT'
        ? 'ONLINE'
        : 'OFFLINE';

    const newApt = await appointmentService.createAppointment({
      doctorId,
      patientId: finalPatientId,
      appointmentDate,
      appointmentTime: rawTime,
      type: finalType,
      reason: reasonText,
      symptoms: reasonText,
      notes: notes || '',
      createdBy: user.id,
      bookedByRole: user.role as any,
    });

    return sendSuccess(res, newApt, 'Appointment booked successfully', 201);
  } catch (error: any) {
    // Return 409 Conflict for double-booking conflicts
    if (error.isConflict || error.statusCode === 409 || error.code === 11000) {
      return sendError(res, error.message || 'The selected doctor/time slot is already booked.', 409);
    }

    // Return 400 Bad Request for validation errors (e.g. past dates, invalid slots)
    if (
      error.message?.includes('past') ||
      error.message?.includes('Invalid') ||
      error.message?.includes('required')
    ) {
      return sendError(res, error.message, 400);
    }

    return sendError(res, 'Failed to schedule appointment', 500, error.message);
  }
}

/**
 * Check-in Patient for an Appointment.
 * Transitions status to CHECKED_IN.
 */
export async function checkInAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.getAppointmentById(id);
    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }

    if (appointment.status === 'CANCELLED') {
      return sendError(res, 'Cannot check in a cancelled appointment', 400);
    }

    const updated = await appointmentService.checkInAppointment(id);
    return sendSuccess(res, updated, 'Patient successfully checked in at reception');
  } catch (error) {
    return sendError(res, 'Failed to check in appointment', 500, (error as Error).message);
  }
}

/**
 * Complete Appointment.
 * Transitions status to COMPLETED.
 */
export async function completeAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const appointment = await appointmentService.getAppointmentById(id);
    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }

    // If DOCTOR, verify they are the attending doctor
    if (req.user?.role === 'DOCTOR') {
      const allDocs = await doctorService.getAllDoctors();
      const myDoc = allDocs.find((d: any) => d.userId === req.user?.id || d.email === req.user?.email);
      if (!myDoc || appointment.doctorId !== myDoc.id) {
        return sendError(res, 'Access forbidden: You can only complete consultations assigned to you', 403);
      }
    }

    const updated = await appointmentService.completeAppointment(id, notes);
    return sendSuccess(res, updated, 'Appointment marked as COMPLETED');
  } catch (error) {
    return sendError(res, 'Failed to complete appointment', 500, (error as Error).message);
  }
}

/**
 * Cancel Appointment.
 * Transitions status to CANCELLED and RELEASES the slot for future bookings.
 */
export async function cancelAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const appointment = await appointmentService.getAppointmentById(id);
    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }

    // Role check: PATIENT can only cancel their own appointment
    if (req.user?.role === 'PATIENT') {
      const allPats = await patientService.getAllPatients();
      const myPat = allPats.find((p: any) => p.userId === req.user?.id || p.email === req.user?.email);
      if (!myPat || appointment.patientId !== myPat.id) {
        return sendError(res, 'Access forbidden: You cannot cancel appointments for other patients', 403);
      }
    }

    if (appointment.status === 'COMPLETED') {
      return sendError(res, 'Cannot cancel an already completed consultation', 400);
    }

    const updated = await appointmentService.cancelAppointment(id, reason);
    return sendSuccess(res, updated, 'Appointment successfully cancelled and consultation slot released');
  } catch (error) {
    return sendError(res, 'Failed to cancel appointment', 500, (error as Error).message);
  }
}

/**
 * Update Status (Backward compatibility).
 */
export async function updateAppointmentStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const appointment = await appointmentService.getAppointmentById(id);
    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }

    if (req.user?.role === 'PATIENT') {
      const allPats = await patientService.getAllPatients();
      const myPat = allPats.find((p: any) => p.userId === req.user?.id || p.email === req.user?.email);
      if (!myPat || appointment.patientId !== myPat.id) {
        return sendError(res, 'Access forbidden: You cannot modify appointments for other patients', 403);
      }
      if (status !== 'CANCELLED') {
        return sendError(res, 'Access forbidden: Patients may only cancel their appointments', 403);
      }
    }

    const updated = await appointmentService.updateAppointmentStatus(id, status, notes);
    return sendSuccess(res, updated, `Appointment status updated to ${status}`);
  } catch (error) {
    return sendError(res, 'Failed to update appointment status', 500, (error as Error).message);
  }
}

/**
 * Update Appointment details.
 */
export async function updateAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, notes, reason } = req.body;
    const updated = await appointmentService.updateAppointmentStatus(id, status || 'CONFIRMED', notes || reason);
    return sendSuccess(res, updated, 'Appointment updated');
  } catch (error) {
    return sendError(res, 'Failed to update appointment', 500, (error as Error).message);
  }
}

/**
 * Delete Appointment.
 * Admin only.
 */
export async function deleteAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await appointmentService.deleteAppointment(id);
    return sendSuccess(res, null, 'Appointment deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete appointment', 500, (error as Error).message);
  }
}
