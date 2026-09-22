import { api } from './api';
import { ApiResponse, Prescription } from '../types';

export const prescriptionService = {
  async getPrescriptions(params?: {
    patientId?: string;
    doctorId?: string;
    appointmentId?: string;
  }): Promise<Prescription[]> {
    const res = await api.get<ApiResponse<Prescription[]>>('/prescriptions', { params });
    return res.data.data;
  },

  async getPrescriptionById(id: string): Promise<Prescription> {
    const res = await api.get<ApiResponse<Prescription>>(`/prescriptions/${id}`);
    return res.data.data;
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
  }): Promise<Prescription> {
    const res = await api.post<ApiResponse<Prescription>>('/prescriptions', data);
    return res.data.data;
  },
};
