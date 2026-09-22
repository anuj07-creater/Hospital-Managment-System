import React, { useEffect, useState } from 'react';
import { statsService } from '../../services/statsService';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { Doctor, Appointment, Patient } from '../../types';
import { StatsCard } from '../../components/common/StatsCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  UserPlus,
  CalendarPlus,
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ReceptionistDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, docs, apts] = await Promise.all([
          statsService.getDashboardStats(),
          doctorService.getDoctors(),
          appointmentService.getAppointments(),
        ]);
        setStats(statsRes.stats);
        setDoctors(docs);
        setAppointments(apts);
      } catch (err) {
        console.error('Failed to load reception desk data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading Front-Desk Operations Station...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Receptionist Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Front-Desk & Registration Station
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Patient Admission & Intake Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register walk-in outpatients, issue OPD visit tokens, and verify doctor clinic schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/patients')}>
            <UserPlus className="w-4 h-4" />
            Register Walk-in Patient
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/appointments')}>
            <CalendarPlus className="w-4 h-4" />
            Book Offline Token
          </Button>
        </div>
      </div>

      {/* Reception KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Today's Walk-in Footfall"
          value={stats?.walkInsToday || 18}
          subtitle="Desk admissions registered"
          icon={Users}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatsCard
          title="Doctors Available Now"
          value={stats?.availableDoctorsCount || doctors.length}
          subtitle="Active consultation rooms"
          icon={Stethoscope}
          iconColor="text-emerald-600 bg-emerald-50"
          badgeText="Active OPD"
        />
        <StatsCard
          title="Tokens in Waiting"
          value={appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING').length}
          subtitle="Waiting in lounge"
          icon={Clock}
          iconColor="text-amber-600 bg-amber-50"
        />
      </div>

      {/* OPD Doctor Status & Quick Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctors in Rooms */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">OPD Chamber Status</h2>
              <p className="text-xs text-slate-500">Doctor availability and consultation fees</p>
            </div>
            <Badge variant="green" size="sm">
              Live Roster
            </Badge>
          </div>

          <div className="space-y-3">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{doc.name}</h3>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                      {doc.roomNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{doc.specialization} • Fee: ₹{doc.consultationFee}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Available
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Admissions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Desk Appointments</h2>
              <p className="text-xs text-slate-500">Latest scheduled patient visits</p>
            </div>
            <button
              onClick={() => navigate('/appointments')}
              className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {appointments.slice(0, 4).map((apt) => (
              <div
                key={apt.id}
                className="p-3 rounded-lg border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{apt.patientName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({apt.patientMRN})</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    To: {apt.doctorName} • {apt.timeSlot}
                  </p>
                </div>
                <Badge variant={apt.status === 'COMPLETED' ? 'green' : 'amber'} size="sm">
                  {apt.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
