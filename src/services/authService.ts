import api from './api';
import { ApiResponse, User, UserRole } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterPatientData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  address?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
    return response.data.data;
  },

  async register(data: RegisterPatientData): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', data);
    return response.data.data;
  },

  async quickDemoLogin(role: UserRole): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/demo-login', { role });
    return response.data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<any>>('/auth/me');
    const data = response.data.data;
    // Handle both { user: User } and direct User payload
    return data.user || data;
  },
};
