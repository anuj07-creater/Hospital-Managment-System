/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Unauthorized } from './pages/Unauthorized';
import { DashboardDispatcher } from './pages/dashboard/DashboardDispatcher';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { DoctorDashboard } from './pages/dashboard/DoctorDashboard';
import { ReceptionistDashboard } from './pages/dashboard/ReceptionistDashboard';
import { PatientDashboard } from './pages/dashboard/PatientDashboard';
import { AppointmentsPage } from './pages/appointments/AppointmentsPage';
import { DoctorsPage } from './pages/doctors/DoctorsPage';
import { PatientsPage } from './pages/patients/PatientsPage';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Authenticated Root Application */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Root redirector based on actual role */}
              <Route path="/" element={<DashboardDispatcher />} />

              {/* Dedicated Role-Based Dashboard Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
                <Route path="/doctor" element={<DoctorDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['RECEPTIONIST']} />}>
                <Route path="/receptionist" element={<ReceptionistDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
                <Route path="/patient" element={<PatientDashboard />} />
              </Route>

              {/* Shared Protected Modules */}
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />

              {/* Role-Restricted Patient Records (Medical staff only) */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={['ADMIN', 'DOCTOR', 'RECEPTIONIST']}
                  />
                }
              >
                <Route path="/patients" element={<PatientsPage />} />
              </Route>

              {/* 404 Fallback within shell */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>

          {/* Catch-all global redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
