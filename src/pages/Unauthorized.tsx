import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleReturnToDashboard = () => {
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

  const handleSwitchAccount = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-6 text-rose-600">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full">
          HTTP 403 • Authorization Required
        </span>

        <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-2 tracking-tight">
          Restricted Clinical Area
        </h1>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Your authenticated account (<span className="font-semibold text-slate-800">{user?.name || 'User'}</span>) is assigned the role of{' '}
          <span className="font-semibold text-rose-600 uppercase">{role || 'GUEST'}</span>. You do not have security clearance for this protected hospital endpoint.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200/80 text-left text-xs text-slate-500 space-y-1.5">
          <div className="flex justify-between">
            <span>Security Policy:</span>
            <span className="font-medium text-slate-700">Strict Server-Enforced RBAC</span>
          </div>
          <div className="flex justify-between">
            <span>Identity Token:</span>
            <span className="font-medium text-emerald-600 font-mono">Verified JWT</span>
          </div>
          <div className="flex justify-between">
            <span>Access Audit:</span>
            <span className="font-medium text-slate-700">Logged to Security Console</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            className="flex-1 justify-center"
            onClick={handleReturnToDashboard}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My Dashboard</span>
          </Button>

          <Button
            variant="outline"
            className="flex-1 justify-center text-slate-700"
            onClick={handleSwitchAccount}
          >
            <LogOut className="w-4 h-4" />
            <span>Switch Account</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
