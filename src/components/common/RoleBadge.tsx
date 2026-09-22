import React from 'react';
import { UserRole } from '../../types';
import { ShieldCheck, Stethoscope, UserCheck, User } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, showIcon = true }) => {
  const config = {
    ADMIN: {
      label: 'Admin',
      classes: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: ShieldCheck,
    },
    DOCTOR: {
      label: 'Doctor',
      classes: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Stethoscope,
    },
    RECEPTIONIST: {
      label: 'Receptionist',
      classes: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: UserCheck,
    },
    PATIENT: {
      label: 'Patient',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: User,
    },
  }[role];

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
};
