import React, { useEffect, useState } from 'react';
import { statsService } from '../../services/statsService';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types';
import { StatsCard } from '../../components/common/StatsCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Calendar,
  FileText,
  HeartPulse,
  Clock,
  ShieldAlert,
  CalendarPlus,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PatientDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, apts] = await Promise.all([
          statsService.getDashboardStats(),
          appointmentService.getAppointments(),
        ]);
        setStats(statsRes.stats);
        setAppointments(apts);
      } catch (err) {
        console.error('Failed to load patient dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading Patient Health Record Summary...
      </div>
    );
  }

  const upcomingApt = appointments.find((a) => a.status === 'CONFIRMED' || a.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Patient Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Patient Health Summary
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Hello, {stats?.patientName || 'Patient'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            MRN: <span className="font-mono font-bold text-slate-700">{stats?.mrn || 'MRN-2026-0101'}</span> • Blood Group: <span className="font-semibold text-rose-600">{stats?.bloodGroup || 'B+'}</span>
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => navigate('/appointments')}>
          <CalendarPlus className="w-4 h-4" />
          Book Online Consultation
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Consultations"
          value={appointments.length}
          subtitle="Lifetime visits at Raut Hospital"
          icon={Calendar}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatsCard
          title="Active Prescriptions"
          value={stats?.activePrescriptionsCount || 2}
          subtitle="Medications on clinical record"
          icon={FileText}
          iconColor="text-purple-600 bg-purple-50"
        />
        <StatsCard
          title="Health Profile Status"
          value="Verified"
          subtitle="Allergies & vitals logged"
          icon={HeartPulse}
          iconColor="text-emerald-600 bg-emerald-50"
          badgeText="Active"
        />
      </div>

      {/* Next Appointment Card & Clinical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Your Next Upcoming Consultation</h2>

          {upcomingApt ? (
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-blue-950">{upcomingApt.doctorName}</h3>
                  <p className="text-xs text-blue-700">{upcomingApt.doctorSpecialty}</p>
                </div>
                <Badge variant="blue">Token #{upcomingApt.tokenNumber}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-blue-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Appointment Date:</span>
                  <span className="font-semibold text-slate-800">{upcomingApt.appointmentDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Time Slot:</span>
                  <span className="font-semibold text-slate-800">{upcomingApt.timeSlot}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                <span className="font-semibold">Reason for visit:</span> {upcomingApt.symptoms}
              </p>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
              No upcoming appointments scheduled. Click "Book Online Consultation" to schedule one.
            </div>
          )}
        </div>

        {/* Clinical Alerts / Allergies */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">Recorded Allergies</h2>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs space-y-2 text-amber-900">
            <p className="font-semibold">Known Drug Sensitivities:</p>
            <div className="flex flex-wrap gap-1.5">
              {(stats?.allergies || ['Penicillin']).map((al: string) => (
                <span key={al} className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-medium text-[11px]">
                  {al}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-amber-700">
              Informed to hospital pharmacy and OPD doctors during prescription generation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
