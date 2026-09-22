import mongoose from 'mongoose';
import { Appointment, IAppointment } from '../models/Appointment';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { isMongoConnected } from '../config/db';
import { hospitalStore } from './storeService';
import {
  HOSPITAL_CONSULTATION_SLOTS,
  normalizeSlotTime,
  isSlotInPast,
} from '../constants/slots';

export interface ConflictError extends Error {
  statusCode?: number;
  isConflict?: boolean;
}

export function createConflictError(message: string): ConflictError {
  const err: ConflictError = new Error(message);
  err.statusCode = 409;
  err.isConflict = true;
  return err;
}

export const appointmentService = {
  async getAllAppointments(filter: {
    doctorId?: string;
    patientId?: string;
    status?: string;
    date?: string;
    type?: string;
  } = {}) {
    if (isMongoConnected()) {
      const query: any = {};
      if (filter.doctorId) query.doctorId = filter.doctorId;
      if (filter.patientId) query.patientId = filter.patientId;
      if (filter.status && filter.status !== 'ALL') query.status = filter.status;
      if (filter.date) query.appointmentDate = filter.date;
      if (filter.type && filter.type !== 'ALL') query.type = filter.type;

      const apts = await Appointment.find(query)
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'name email phone' },
        })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email phone' },
        })
        .populate('createdBy', 'name role')
        .sort({ appointmentDate: -1, appointmentTime: 1, createdAt: -1 })
        .lean();

      return apts.map((a: any) => ({
        id: a._id.toString(),
        patientId: a.patientId?._id?.toString() || a.patientId?.toString(),
        patientMRN: a.patientId?.medicalRecordNumber || 'MRN-PENDING',
        patientName: a.patientId?.userId?.name || 'Hospital Patient',
        patientPhone: a.patientId?.userId?.phone || a.patientId?.phone || '',
        doctorId: a.doctorId?._id?.toString() || a.doctorId?.toString(),
        doctorName: a.doctorId?.userId?.name || 'Dr. Specialist',
        doctorSpecialty: a.doctorId?.specialization || 'Consultant',
        appointmentDate: a.appointmentDate,
        timeSlot: a.appointmentTime,
        appointmentTime: a.appointmentTime,
        type: a.type,
        status: a.status,
        symptoms: a.reason,
        reason: a.reason,
        tokenNumber: a.tokenNumber,
        bookedByRole: a.bookedByRole || 'PATIENT',
        createdBy: a.createdBy?._id?.toString() || a.createdBy?.toString(),
        createdByName: a.createdBy?.name || '',
        notes: a.notes || '',
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }));
    }

    let list = [...hospitalStore.appointments];
    if (filter.doctorId) list = list.filter((a) => a.doctorId === filter.doctorId);
    if (filter.patientId) list = list.filter((a) => a.patientId === filter.patientId);
    if (filter.status && filter.status !== 'ALL') list = list.filter((a) => a.status === filter.status);
    if (filter.date) list = list.filter((a) => a.appointmentDate === filter.date);
    if (filter.type && filter.type !== 'ALL') list = list.filter((a) => a.type === filter.type);
    return list;
  },

  async getAppointmentById(id: string) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      if (!isMongoConnected()) {
        return hospitalStore.appointments.find((a) => a.id === id) || null;
      }
      return null;
    }

    if (isMongoConnected()) {
      const a: any = await Appointment.findById(id)
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'name email phone' },
        })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email phone' },
        })
        .populate('createdBy', 'name role')
        .lean();

      if (!a) return null;
      return {
        id: a._id.toString(),
        patientId: a.patientId?._id?.toString() || a.patientId?.toString(),
        patientMRN: a.patientId?.medicalRecordNumber || 'MRN-PENDING',
        patientName: a.patientId?.userId?.name || 'Hospital Patient',
        patientPhone: a.patientId?.userId?.phone || a.patientId?.phone || '',
        doctorId: a.doctorId?._id?.toString() || a.doctorId?.toString(),
        doctorName: a.doctorId?.userId?.name || 'Dr. Specialist',
        doctorSpecialty: a.doctorId?.specialization || 'Consultant',
        appointmentDate: a.appointmentDate,
        timeSlot: a.appointmentTime,
        appointmentTime: a.appointmentTime,
        type: a.type,
        status: a.status,
        symptoms: a.reason,
        reason: a.reason,
        tokenNumber: a.tokenNumber,
        bookedByRole: a.bookedByRole || 'PATIENT',
        createdBy: a.createdBy?._id?.toString() || a.createdBy?.toString(),
        notes: a.notes || '',
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      };
    }

    return hospitalStore.appointments.find((a) => a.id === id) || null;
  },

  /**
   * Unified Availability for a Doctor on a Date.
   * Both online patients and offline receptionists query the exact same underlying slot availability.
   * Excludes unnecessary patient identity info per privacy requirements.
   */
  async getDoctorAvailability(doctorId: string, dateStr: string) {
    const activeStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED'];

    let activeAppointments: any[] = [];
    if (isMongoConnected()) {
      activeAppointments = await Appointment.find({
        doctorId: new mongoose.Types.ObjectId(doctorId) as any,
        appointmentDate: dateStr,
        status: { $in: activeStatuses } as any,
      }).lean();
    } else {
      activeAppointments = hospitalStore.appointments.filter(
        (a) =>
          a.doctorId === doctorId &&
          a.appointmentDate === dateStr &&
          activeStatuses.includes(a.status)
      );
    }

    const slots = HOSPITAL_CONSULTATION_SLOTS.map((slot) => {
      // Find active appointment occupying this normalized slot
      const occupied = activeAppointments.find(
        (a) => normalizeSlotTime(a.appointmentTime || a.timeSlot) === slot
      );

      if (occupied) {
        return {
          slot,
          status: occupied.type, // 'ONLINE' or 'OFFLINE'
          isAvailable: false,
          isPast: false,
          appointmentStatus: occupied.status,
        };
      }

      const past = isSlotInPast(dateStr, slot);
      return {
        slot,
        status: past ? 'PAST' : 'AVAILABLE',
        isAvailable: !past,
        isPast: past,
      };
    });

    return {
      doctorId,
      date: dateStr,
      slots,
    };
  },

  /**
   * Full Doctor Schedule with Patient Roster.
   * Used by RECEPTIONIST, DOCTOR, and ADMIN to view exact slot bookings.
   */
  async getDoctorSchedule(doctorId: string, dateStr: string) {
    const activeStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED'];

    let activeAppointments: any[] = [];
    if (isMongoConnected()) {
      activeAppointments = await Appointment.find({
        doctorId: new mongoose.Types.ObjectId(doctorId) as any,
        appointmentDate: dateStr,
        status: { $in: activeStatuses } as any,
      })
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'name email phone' },
        })
        .lean();
    } else {
      activeAppointments = hospitalStore.appointments.filter(
        (a) =>
          a.doctorId === doctorId &&
          a.appointmentDate === dateStr &&
          activeStatuses.includes(a.status)
      );
    }

    const schedule = HOSPITAL_CONSULTATION_SLOTS.map((slot) => {
      const occupied: any = activeAppointments.find(
        (a) => normalizeSlotTime(a.appointmentTime || a.timeSlot) === slot
      );

      if (occupied) {
        return {
          slot,
          status: occupied.type, // 'ONLINE' | 'OFFLINE'
          isAvailable: false,
          isPast: false,
          appointment: {
            id: occupied._id?.toString() || occupied.id,
            patientId: occupied.patientId?._id?.toString() || occupied.patientId,
            patientName:
              occupied.patientId?.userId?.name || occupied.patientName || 'Patient',
            patientMRN:
              occupied.patientId?.medicalRecordNumber || occupied.patientMRN || 'MRN-PENDING',
            patientPhone:
              occupied.patientId?.userId?.phone || occupied.patientPhone || '',
            type: occupied.type,
            status: occupied.status,
            reason: occupied.reason || occupied.symptoms || '',
            tokenNumber: occupied.tokenNumber || 1,
            bookedByRole: occupied.bookedByRole || 'PATIENT',
          },
        };
      }

      const past = isSlotInPast(dateStr, slot);
      return {
        slot,
        status: past ? 'PAST' : 'AVAILABLE',
        isAvailable: !past,
        isPast: past,
        appointment: null,
      };
    });

    return {
      doctorId,
      date: dateStr,
      schedule,
    };
  },

  /**
   * Create an appointment with STRICT double-booking prevention.
   * Both ONLINE and OFFLINE bookings are checked against the same doctor/date/time availability.
   * If a slot has an active appointment (PENDING, CONFIRMED, CHECKED_IN, COMPLETED), creation fails with 409 Conflict.
   */
  async createAppointment(data: {
    patientId: string;
    doctorId: string;
    appointmentDate: string;
    appointmentTime?: string;
    timeSlot?: string;
    type?: 'ONLINE' | 'OFFLINE';
    reason?: string;
    symptoms?: string;
    notes?: string;
    createdBy: string;
    bookedByRole?: 'PATIENT' | 'RECEPTIONIST' | 'ADMIN';
  }) {
    const rawSlot = data.appointmentTime || data.timeSlot;
    if (!rawSlot) {
      throw new Error('Appointment time or slot is required');
    }

    const normalizedSlot = normalizeSlotTime(rawSlot);
    const reasonText = (data.reason || data.symptoms || '').trim();

    if (!reasonText) {
      throw new Error('Reason for appointment / chief symptoms is required');
    }

    // 1. Verify valid standard consultation slot
    if (!HOSPITAL_CONSULTATION_SLOTS.includes(normalizedSlot as any)) {
      throw new Error(
        `Invalid appointment slot "${rawSlot}". Must be one of the standard consultation slots: ${HOSPITAL_CONSULTATION_SLOTS.join(', ')}`
      );
    }

    // 2. Reject past date/time booking
    if (isSlotInPast(data.appointmentDate, normalizedSlot)) {
      throw new Error('Cannot book an appointment in the past. Please select a future date and time.');
    }

    const appointmentType: 'ONLINE' | 'OFFLINE' = data.type === 'ONLINE' ? 'ONLINE' : 'OFFLINE';
    const activeStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED'];

    if (isMongoConnected()) {
      // 3. FINAL AVAILABILITY CHECK: Atomic pre-check for existing active appointment with this doctor
      const existingDoctorBooking: any = await Appointment.findOne({
        doctorId: new mongoose.Types.ObjectId(data.doctorId) as any,
        appointmentDate: data.appointmentDate,
        appointmentTime: normalizedSlot,
        status: { $in: activeStatuses } as any,
      }).lean();

      if (existingDoctorBooking) {
        throw createConflictError(
          `The selected consultation slot (${normalizedSlot}) is already booked (${existingDoctorBooking.type}) with this doctor. A doctor cannot have two active appointments at the same date and time.`
        );
      }

      // 4. Duplicate booking check for patient: prevent same patient from booking same slot twice
      const existingPatientBooking: any = await Appointment.findOne({
        patientId: new mongoose.Types.ObjectId(data.patientId) as any,
        appointmentDate: data.appointmentDate,
        appointmentTime: normalizedSlot,
        status: { $in: activeStatuses } as any,
      }).lean();

      if (existingPatientBooking) {
        throw createConflictError(
          `Patient already has an active ${existingPatientBooking.type} appointment scheduled at ${normalizedSlot} on ${data.appointmentDate}.`
        );
      }

      // 5. Daily token calculation for this doctor on this day
      const sameDayCount = await Appointment.countDocuments({
        doctorId: new mongoose.Types.ObjectId(data.doctorId) as any,
        appointmentDate: data.appointmentDate,
      });

      try {
        const apt: any = await Appointment.create({
          patientId: new mongoose.Types.ObjectId(data.patientId),
          doctorId: new mongoose.Types.ObjectId(data.doctorId),
          appointmentDate: data.appointmentDate,
          appointmentTime: normalizedSlot,
          type: appointmentType,
          status: 'CONFIRMED',
          reason: reasonText,
          notes: data.notes || '',
          tokenNumber: sameDayCount + 1,
          bookedByRole: data.bookedByRole || 'PATIENT',
          createdBy: new mongoose.Types.ObjectId(data.createdBy),
        } as any);

        return await this.getAppointmentById(apt._id.toString());
      } catch (err: any) {
        // Handle race conditions caught by MongoDB compound partial unique index (E11000)
        if (err.code === 11000) {
          throw createConflictError(
            `The selected slot (${normalizedSlot}) has just been booked by another user. Please choose another available slot.`
          );
        }
        throw err;
      }
    }

    // Fallback store double-booking prevention
    const existingDoctorBooking = hospitalStore.appointments.find(
      (a) =>
        a.doctorId === data.doctorId &&
        a.appointmentDate === data.appointmentDate &&
        normalizeSlotTime(a.appointmentTime || a.timeSlot) === normalizedSlot &&
        activeStatuses.includes(a.status)
    );

    if (existingDoctorBooking) {
      throw createConflictError(
        `The selected consultation slot (${normalizedSlot}) is already booked (${existingDoctorBooking.type}) with this doctor.`
      );
    }

    const doc = hospitalStore.doctors.find((d) => d.id === data.doctorId);
    const pat = hospitalStore.patients.find((p) => p.id === data.patientId);

    const newApt = {
      id: `apt-${Date.now().toString().slice(-4)}`,
      patientId: data.patientId,
      patientName: pat?.name || 'Patient',
      patientMRN: pat?.medicalRecordNumber || 'MRN-2026-0042',
      doctorId: data.doctorId,
      doctorName: doc?.name || 'Dr. Specialist',
      doctorSpecialty: doc?.specialization || 'Consultant',
      appointmentDate: data.appointmentDate,
      timeSlot: normalizedSlot,
      appointmentTime: normalizedSlot,
      type: appointmentType,
      status: 'CONFIRMED' as const,
      reason: reasonText,
      symptoms: reasonText,
      tokenNumber: hospitalStore.appointments.length + 1,
      bookedByRole: data.bookedByRole || 'PATIENT',
      notes: data.notes || '',
      createdBy: data.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    hospitalStore.appointments.unshift(newApt);
    return newApt;
  },

  async updateAppointmentStatus(id: string, status: string, notes?: string) {
    if (isMongoConnected()) {
      const updateData: any = { status };
      if (notes !== undefined) updateData.notes = notes;

      await Appointment.findByIdAndUpdate(id, updateData);
      return await this.getAppointmentById(id);
    }

    const apt = hospitalStore.appointments.find((a) => a.id === id);
    if (apt) {
      apt.status = status as any;
      if (notes !== undefined) apt.notes = notes;
    }
    return apt;
  },

  async checkInAppointment(id: string) {
    return await this.updateAppointmentStatus(id, 'CHECKED_IN');
  },

  async completeAppointment(id: string, notes?: string) {
    return await this.updateAppointmentStatus(id, 'COMPLETED', notes);
  },

  async cancelAppointment(id: string, reason?: string) {
    return await this.updateAppointmentStatus(id, 'CANCELLED', reason);
  },

  async deleteAppointment(id: string) {
    if (isMongoConnected()) {
      await Appointment.findByIdAndDelete(id);
      return true;
    }
    const idx = hospitalStore.appointments.findIndex((a) => a.id === id);
    if (idx !== -1) {
      hospitalStore.appointments.splice(idx, 1);
      return true;
    }
    return false;
  },
};
