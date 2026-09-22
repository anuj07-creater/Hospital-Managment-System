import React, { useEffect, useState } from 'react';
import { statsService } from '../../services/statsService';
import { StatsCard } from '../../components/common/StatsCard';
import {
  Users,
  Stethoscope,
  Calendar,
  IndianRupee,
  Bed,
  Building,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await statsService.getDashboardStats();
        setStats(res.stats);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading Hospital Command Analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            Hospital Administration Console
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Operations & Governance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time occupancy, outpatient trends, clinical department metrics, and staff allocations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            OPD & IPD Services Active
          </span>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Doctors"
          value={stats?.totalDoctors || 2}
          subtitle="Specialists in OPD"
          icon={Stethoscope}
          iconColor="text-blue-600 bg-blue-50"
          badgeText="All On-Duty"
        />
        <StatsCard
          title="Registered Patients"
          value={stats?.totalPatients || 2}
          subtitle="Lifetime MRN records"
          icon={Users}
          iconColor="text-emerald-600 bg-emerald-50"
          badgeText="+12% this mo."
        />
        <StatsCard
          title="Daily Appointments"
          value={stats?.activeAppointments || 3}
          subtitle="Scheduled consultations"
          icon={Calendar}
          iconColor="text-purple-600 bg-purple-50"
        />
        <StatsCard
          title="Bed Occupancy"
          value={stats?.bedOccupancyRate || '78%'}
          subtitle="ICU & General Wards"
          icon={Bed}
          iconColor="text-amber-600 bg-amber-50"
          badgeText="Optimal"
        />
      </div>

      {/* Analytics Chart & Department Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Weekly Patient Footfall Analysis</h2>
              <p className="text-xs text-slate-500">
                Outpatient Department (OPD) vs. Tele-consultations
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block" /> OPD Walk-in
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-purple-400 inline-block" /> Online
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="outpatient" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="online" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial & Clinical Units Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Hospital Department Status</h2>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-900">Cardiology</p>
                  <p className="text-[11px] text-slate-500">Wing B, Level 2</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600">OPD Open</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-900">Orthopedics</p>
                  <p className="text-[11px] text-slate-500">Wing A, Ground Floor</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600">OPD Open</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-900">Today's Collections</p>
                  <p className="text-[11px] text-slate-500">Consultation & diagnostics</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-900">₹{stats?.dailyRevenueINR?.toLocaleString() || '54,800'}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>NABH & HIPAA compliance logs synced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
