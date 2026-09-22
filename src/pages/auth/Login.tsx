import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Button } from '../../components/common/Button';
import {
  Activity,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  User,
  Lock,
  Mail,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('admin@raut-hospital.org');
  const [password, setPassword] = useState<string>('admin123');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [activeQuickRole, setActiveQuickRole] = useState<string | null>(null);

  const redirectToRoleDashboard = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        navigate('/admin');
        break;
      case 'DOCTOR':
        navigate('/doctor');
        break;
      case 'RECEPTIONIST':
        navigate('/receptionist');
        break;
      case 'PATIENT':
        navigate('/patient');
        break;
      default:
        navigate('/');
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const user = await login(email, password);
      redirectToRoleDashboard(user.role);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          'Invalid login credentials. Please verify your email and password.'
      );
    }
  };

  const handleQuickCredentialLogin = async (acctEmail: string, acctPass: string, roleName: string) => {
    setErrorMsg('');
    setActiveQuickRole(roleName);
    setEmail(acctEmail);
    setPassword(acctPass);
    try {
      const user = await login(acctEmail, acctPass);
      redirectToRoleDashboard(user.role);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Authentication failed for demo credentials');
    } finally {
      setActiveQuickRole(null);
    }
  };

  const demoAccounts: {
    role: UserRole;
    name: string;
    email: string;
    pass: string;
    icon: any;
    color: string;
  }[] = [
    {
      role: 'ADMIN',
      name: 'Dr. Anand Raut',
      email: 'admin@raut-hospital.org',
      pass: 'admin123',
      icon: ShieldCheck,
      color: 'border-purple-200 hover:bg-purple-50 text-purple-700',
    },
    {
      role: 'DOCTOR',
      name: 'Dr. Sarah Sharma',
      email: 'dr.sarah@raut-hospital.org',
      pass: 'doctor123',
      icon: Stethoscope,
      color: 'border-blue-200 hover:bg-blue-50 text-blue-700',
    },
    {
      role: 'RECEPTIONIST',
      name: 'Pooja Verma',
      email: 'reception@raut-hospital.org',
      pass: 'reception123',
      icon: UserCheck,
      color: 'border-amber-200 hover:bg-amber-50 text-amber-800',
    },
    {
      role: 'PATIENT',
      name: 'Rahul Kulkarni',
      email: 'patient.rahul@gmail.com',
      pass: 'patient123',
      icon: User,
      color: 'border-emerald-200 hover:bg-emerald-50 text-emerald-700',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              RAUT HOSPITAL
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Hospital Management System (RHMS)
            </p>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">
          MERN Enterprise Architecture with Strict Server-Enforced RBAC
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-slate-200 sm:px-10">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Access (Authenticates against real seeded MongoDB database) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                1-Click Verified Role Credentials:
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acct) => {
                const Icon = acct.icon;
                const isCurrentActive = activeQuickRole === acct.role;
                return (
                  <button
                    key={acct.role}
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickCredentialLogin(acct.email, acct.pass, acct.role)}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${acct.color} ${
                      isCurrentActive ? 'ring-2 ring-blue-500 bg-slate-50' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate">{acct.role}</p>
                      <p className="text-[10px] text-slate-500 truncate">{acct.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400">or sign in with password</span>
            </div>
          </div>

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hospital Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full justify-center" isLoading={loading}>
              Sign In to RHMS
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            New patient without an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Register as Patient
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
