import api from './api';
import {
  ApiResponse,
  Appointment,
  SlotAvailability,
  DoctorScheduleSlot,
} from '../types';

export interface CreateAppointmentPayload {
  doctorId: string;
  patientId?: string;
  appointmentDate: string;
  appointmentTime?: string;
  timeSlot?: string;
  type?: 'ONLINE' | 'OFFLINE';
  symptoms?: string;
  reason?: string;
  notes?: string;
}

export interface DoctorAvailabilityResponse {
  doctorId: string;
  date: string;
  slots: SlotAvailability[];
}

export interface DoctorScheduleResponse {
  doctorId: string;
  date: string;
  schedule: DoctorScheduleSlot[];
}

export const appointmentService = {
  async getAppointments(filters?: {
    status?: string;
    date?: string;
    doctorId?: string;
    patientId?: string;
    type?: string;
  }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.type && filters.type !== 'ALL') params.append('type', filters.type);

    const queryString = params.toString();
    const url = queryString ? `/appointments?${queryString}` : '/appointments';
    const response = await api.get<ApiResponse<Appointment[]>>(url);
    return response.data.data;
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await api.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return response.data.data;
  },

  async getDoctorAvailability(
    doctorId: string,
    date: string
  ): Promise<DoctorAvailabilityResponse> {
    const response = await api.get<ApiResponse<DoctorAvailabilityResponse>>(
      `/appointments/availability?doctorId=${doctorId}&date=${date}`
    );
    return response.data.data;
  },

  async getDoctorSchedule(
    doctorId: string,
    date: string
  ): Promise<DoctorScheduleResponse> {
    const response = await api.get<ApiResponse<DoctorScheduleResponse>>(
      `/appointments/doctor/${doctorId}/schedule?date=${date}`
    );
    return response.data.data;
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    const response = await api.post<ApiResponse<Appointment>>('/appointments', payload);
    return response.data.data;
  },

  async checkIn(id: string): Promise<Appointment> {
    const response = await api.post<ApiResponse<Appointment>>(`/appointments/${id}/check-in`);
    return response.data.data;
  },

  async complete(id: string, notes?: string): Promise<Appointment> {
    const response = await api.post<ApiResponse<Appointment>>(`/appointments/${id}/complete`, { notes });
    return response.data.data;
  },

  async cancel(id: string, reason?: string): Promise<Appointment> {
    const response = await api.post<ApiResponse<Appointment>>(`/appointments/${id}/cancel`, { reason });
    return response.data.data;
  },

  async updateStatus(id: string, status: string, notes?: string): Promise<Appointment> {
    const response = await api.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, {
      status,
      notes,
    });
    return response.data.data;
  },
};
