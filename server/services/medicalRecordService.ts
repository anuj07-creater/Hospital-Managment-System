import { MedicalRecord, IMedicalRecord } from '../models/MedicalRecord';
import { isMongoConnected } from '../config/db';

export const medicalRecordService = {
  async getAllMedicalRecords(filter: { patientId?: string; doctorId?: string } = {}) {
    if (isMongoConnected()) {
      const query: any = {};
      if (filter.patientId) query.patientId = filter.patientId;
      if (filter.doctorId) query.doctorId = filter.doctorId;

      const records = await MedicalRecord.find(query)
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'name email phone' },
        })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email' },
        })
        .sort({ date: -1 });

      return records.map((r: any) => ({
        id: r._id.toString(),
        patientId: r.patientId?._id?.toString() || r.patientId?.toString(),
        patientName: r.patientId?.userId?.name || 'Patient',
        patientMRN: r.patientId?.medicalRecordNumber || 'MRN-RECORD',
        doctorId: r.doctorId?._id?.toString() || r.doctorId?.toString(),
        doctorName: r.doctorId?.userId?.name || 'Dr. Specialist',
        appointmentId: r.appointmentId?.toString(),
        diagnosis: r.diagnosis,
        notes: r.notes,
        date: r.date,
        attachments: r.attachments,
        createdAt: r.createdAt,
      }));
    }

    return [];
  },

  async getMedicalRecordById(id: string) {
    if (isMongoConnected()) {
      const r: any = await MedicalRecord.findById(id)
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'name email phone' },
        })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email' },
        });

      if (!r) return null;
      return {
        id: r._id.toString(),
        patientId: r.patientId?._id?.toString() || r.patientId?.toString(),
        patientName: r.patientId?.userId?.name || 'Patient',
        patientMRN: r.patientId?.medicalRecordNumber || 'MRN-RECORD',
        doctorId: r.doctorId?._id?.toString() || r.doctorId?.toString(),
        doctorName: r.doctorId?.userId?.name || 'Dr. Specialist',
        appointmentId: r.appointmentId?.toString(),
        diagnosis: r.diagnosis,
        notes: r.notes,
        date: r.date,
        attachments: r.attachments,
        createdAt: r.createdAt,
      };
    }
    return null;
  },

  async createMedicalRecord(data: {
    patientId: string;
    doctorId: string;
    appointmentId?: string;
    diagnosis: string;
    notes?: string;
    date?: Date;
    attachments?: string[];
  }) {
    if (isMongoConnected()) {
      const created = await MedicalRecord.create({
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentId: data.appointmentId,
        diagnosis: data.diagnosis,
        notes: data.notes || '',
        date: data.date || new Date(),
        attachments: data.attachments || [],
      });
      return await this.getMedicalRecordById(created._id.toString());
    }

    return {
      id: `mr-${Date.now().toString().slice(-4)}`,
      ...data,
      date: data.date || new Date(),
    };
  },
};
