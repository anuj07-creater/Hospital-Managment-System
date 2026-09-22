import React, { useEffect, useState } from 'react';
import { doctorService } from '../../services/doctorService';
import { Doctor } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Stethoscope,
  Award,
  Calendar,
  Clock,
  IndianRupee,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const data = await doctorService.getDoctors();
        setDoctors(data);
      } catch (err) {
        console.error('Failed to load doctors:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
          Medical Staff Roster
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
          Specialist Doctors Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Find physicians, check OPD chamber room numbers, consultation fees, and active visiting days.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">
          Loading specialist directory from REST API...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg border border-blue-100">
                      {doc.name.split(' ')[1]?.[0] || 'D'}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{doc.name}</h2>
                      <p className="text-xs font-semibold text-blue-600">{doc.specialization}</p>
                      <p className="text-[11px] text-slate-400">{doc.department} Department</p>
                    </div>
                  </div>
                  <Badge variant="green" size="sm">
                    OPD Active
                  </Badge>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      <strong className="text-slate-800">Qualifications:</strong> {doc.qualification} ({doc.experienceYears}+ years exp)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      <strong className="text-slate-800">Location:</strong> {doc.roomNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      <strong className="text-slate-800">Consultation Fee:</strong> ₹{doc.consultationFee}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      <strong className="text-slate-800">Days:</strong> {doc.availableDays.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">ID: {doc.id}</span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/appointments')}
                >
                  Book with Doctor
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
