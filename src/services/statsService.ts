import api from './api';
import { ApiResponse, UserRole } from '../types';

export interface DashboardStatsResponse {
  role: UserRole;
  stats: any;
}

export const statsService = {
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    const response = await api.get<ApiResponse<DashboardStatsResponse>>('/stats/dashboard');
    return response.data.data;
  },
};
