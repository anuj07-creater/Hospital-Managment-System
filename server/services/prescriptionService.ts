import { Prescription, IPrescription } from '../models/Prescription';
import { isMongoConnected } from '../config/db';

export const prescriptionService = {
  async getAllPrescriptions(filter: { patientId?: string; doctorId?: string; appointmentId?: string } = {}) {
    if (isMongoConnected()) {
      const query: any = {};
      if (filter.patientId) query.patientId = filter.patientId;
      if (filter.doctorId) query.doctorId = filter.doctorId;
      if (filter.appointmentId) query.appointmentId = filter.appointmentId;

      const prescriptions = await Prescription.find(query)
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'name email phone' },
        })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email' },
        })
        .sort({ date: -1 });

      return prescriptions.map((p: any) => ({
        id: p._id.toString(),
        patientId: p.patientId?._id?.toString() || p.patientId?.toString(),
        patientName: p.patientId?.userId?.name || 'Patient',
        patientMRN: p.patientId?.medicalRecordNumber || 'MRN-RECORD',
        doctorId: p.doctorId?._id?.toString() || p.doctorId?.toString(),
        doctorName: p.doctorId?.userId?.name || 'Dr. Specialist',
        appointmentId: p.appointmentId?.toString(),
        diagnosis: p.diagnosis,
        medicines: p.medicines,
        instructions: p.instructions,
        date: p.date,
        createdAt: p.createdAt,
      }));
    }

    return [];
  },

  async getPrescriptionById(id: string) {
    if (isMongoConnected()) {
      const p: any = await Prescription.findById(id)
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'name email phone' },
        })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email' },
        });

      if (!p) return null;
      return {
        id: p._id.toString(),
        patientId: p.patientId?._id?.toString() || p.patientId?.toString(),
        patientName: p.patientId?.userId?.name || 'Patient',
        patientMRN: p.patientId?.medicalRecordNumber || 'MRN-RECORD',
        doctorId: p.doctorId?._id?.toString() || p.doctorId?.toString(),
        doctorName: p.doctorId?.userId?.name || 'Dr. Specialist',
        appointmentId: p.appointmentId?.toString(),
        diagnosis: p.diagnosis,
        medicines: p.medicines,
        instructions: p.instructions,
        date: p.date,
        createdAt: p.createdAt,
      };
    }
    return null;
  },

  async createPrescription(data: {
    patientId: string;
    doctorId: string;
    appointmentId: string;
    diagnosis: string;
    medicines: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
    instructions?: string;
    date?: Date;
  }) {
    if (isMongoConnected()) {
      const created = await Prescription.create({
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentId: data.appointmentId,
        diagnosis: data.diagnosis,
        medicines: data.medicines,
        instructions: data.instructions || '',
        date: data.date || new Date(),
      });
      return await this.getPrescriptionById(created._id.toString());
    }

    return {
      id: `rx-${Date.now().toString().slice(-4)}`,
      ...data,
      date: data.date || new Date(),
    };
  },
};
