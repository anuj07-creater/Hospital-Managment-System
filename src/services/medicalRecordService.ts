import { api } from './api';
import { ApiResponse, MedicalRecord } from '../types';

export const medicalRecordService = {
  async getMedicalRecords(params?: {
    patientId?: string;
    doctorId?: string;
  }): Promise<MedicalRecord[]> {
    const res = await api.get<ApiResponse<MedicalRecord[]>>('/medical-records', { params });
    return res.data.data;
  },

  async getMedicalRecordById(id: string): Promise<MedicalRecord> {
    const res = await api.get<ApiResponse<MedicalRecord>>(`/medical-records/${id}`);
    return res.data.data;
  },

  async createMedicalRecord(data: {
    patientId: string;
    doctorId: string;
    appointmentId?: string;
    diagnosis: string;
    notes?: string;
  }): Promise<MedicalRecord> {
    const res = await api.post<ApiResponse<MedicalRecord>>('/medical-records', data);
    return res.data.data;
  },
};
