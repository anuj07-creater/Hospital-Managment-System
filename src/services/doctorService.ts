import api from './api';
import { ApiResponse, Doctor } from '../types';

export const doctorService = {
  async getDoctors(params?: { department?: string; availableOnly?: boolean }): Promise<Doctor[]> {
    const response = await api.get<ApiResponse<Doctor[]>>('/doctors', { params });
    return response.data.data;
  },

  async getDoctorById(id: string): Promise<Doctor> {
    const response = await api.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    return response.data.data;
  },
};
