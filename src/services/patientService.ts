import api from './api';
import { ApiResponse, Patient } from '../types';

export interface RegisterPatientPayload {
  name: string;
  phone: string;
  email?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export const patientService = {
  async getPatients(search?: string): Promise<Patient[]> {
    const response = await api.get<ApiResponse<Patient[]>>('/patients', {
      params: { search },
    });
    return response.data.data;
  },

  async getPatientById(id: string): Promise<Patient> {
    const response = await api.get<ApiResponse<Patient>>(`/patients/${id}`);
    return response.data.data;
  },

  async registerPatient(payload: RegisterPatientPayload): Promise<Patient> {
    const response = await api.post<ApiResponse<Patient>>('/patients', payload);
    return response.data.data;
  },
};
