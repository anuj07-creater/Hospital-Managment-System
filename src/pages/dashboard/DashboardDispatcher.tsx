import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { DoctorDashboard } from './DoctorDashboard';
import { ReceptionistDashboard } from './ReceptionistDashboard';
import { PatientDashboard } from './PatientDashboard';

export const DashboardDispatcher: React.FC = () => {
  const { role } = useAuth();

  switch (role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'DOCTOR':
      return <DoctorDashboard />;
    case 'RECEPTIONIST':
      return <ReceptionistDashboard />;
    case 'PATIENT':
    default:
      return <PatientDashboard />;
  }
};
