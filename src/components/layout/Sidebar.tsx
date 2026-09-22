import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Stethoscope,
  Users2,
  Server,
  Database,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { role } = useAuth();

  // Determine role-specific primary dashboard path
  const dashboardPath =
    role === 'ADMIN'
      ? '/admin'
      : role === 'DOCTOR'
      ? '/doctor'
      : role === 'RECEPTIONIST'
      ? '/receptionist'
      : '/patient';

  const navItems = [
    {
      to: dashboardPath,
      label: 'Role Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],
    },
    {
      to: '/appointments',
      label: role === 'PATIENT' ? 'My Appointments' : 'Appointments',
      icon: CalendarCheck,
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],
    },
    {
      to: '/doctors',
      label: 'Doctor Directory',
      icon: Stethoscope,
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],
    },
    {
      to: '/patients',
      label: role === 'RECEPTIONIST' ? 'Patient Registry' : 'Patient Records',
      icon: Users2,
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'],
    },
  ];

  // Strictly filter navigation according to actual database-backed role
  const filteredItems = navItems.filter((item) => (role ? item.roles.includes(role) : false));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-[calc(100vh-4rem)]">
      {/* Navigation Links */}
      <div className="p-4 space-y-1 flex-1">
        <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Hospital Navigation
        </p>

        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Backend & Security Telemetry Widget */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2 mb-2">
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">System Security</span>
        </div>
        <div className="space-y-1.5 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Server
            </span>
            <span className="text-emerald-400 font-mono">Port 3000</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-blue-400" />
              Database
            </span>
            <span className="text-blue-300 font-mono">MongoDB Atlas</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              RBAC Guard
            </span>
            <span className="text-purple-300 font-mono uppercase">{role || 'None'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
