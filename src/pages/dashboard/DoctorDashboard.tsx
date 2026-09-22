import React, { useEffect, useState } from 'react';
import { statsService } from '../../services/statsService';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types';
import { StatsCard } from '../../components/common/StatsCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  Video,
  Building,
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
        console.error('Failed to load doctor dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await appointmentService.updateStatus(id, status);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: status as any } : a))
      );
    } catch (err) {
      console.error('Failed to update appointment status:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading Doctor Clinical Workspace...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Doctor Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Doctor Clinical Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Welcome, {stats?.doctorName || 'Doctor'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Department: {stats?.specialization || 'Clinical Medicine'} • OPD Room 204
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-lg font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            OPD Station Active
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Today's Consultations"
          value={appointments.length}
          subtitle="Scheduled roster for today"
          icon={Calendar}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatsCard
          title="Waiting in Queue"
          value={appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING').length}
          subtitle="Patients checked in"
          icon={Clock}
          iconColor="text-amber-600 bg-amber-50"
        />
        <StatsCard
          title="Completed Today"
          value={appointments.filter((a) => a.status === 'COMPLETED').length}
          subtitle="Rx written & dispatched"
          icon={CheckCircle}
          iconColor="text-emerald-600 bg-emerald-50"
        />
      </div>

      {/* Live Patient Queue */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Today's Patient Consultation Queue</h2>
            <p className="text-xs text-slate-500">
              Assigned tokens and clinical consultation requests
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {appointments.length} Records in list
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No consultations currently scheduled for your queue today.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] uppercase font-bold leading-none">Token</span>
                    <span className="text-sm font-bold leading-none mt-0.5">#{apt.tokenNumber}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{apt.patientName}</h3>
                      <Badge variant="blue" size="sm">
                        {apt.patientMRN}
                      </Badge>
                      {apt.type === 'ONLINE' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          <Video className="w-3 h-3" /> Tele-OPD
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          <Building className="w-3 h-3" /> In-Clinic
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      <span className="font-semibold text-slate-700">Symptoms:</span> {apt.symptoms}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Time Slot: {apt.timeSlot} • Date: {apt.appointmentDate}
                    </p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <Badge
                    variant={
                      apt.status === 'COMPLETED'
                        ? 'green'
                        : apt.status === 'IN_PROGRESS'
                        ? 'blue'
                        : apt.status === 'CANCELLED'
                        ? 'red'
                        : 'amber'
                    }
                  >
                    {apt.status}
                  </Badge>

                  {apt.status !== 'COMPLETED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Completed
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
