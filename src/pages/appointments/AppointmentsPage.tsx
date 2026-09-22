import React, { useEffect, useState, useMemo } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';
import { useAuth } from '../../context/AuthContext';
import {
  Appointment,
  Doctor,
  Patient,
  SlotAvailability,
} from '../../types';
import { HOSPITAL_CONSULTATION_SLOTS } from '../../constants/slots';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Calendar,
  Clock,
  Plus,
  Video,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  User,
  Stethoscope,
  RefreshCw,
  Search,
  ShieldAlert,
} from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Matrix Filter State
  const [matrixDoctorId, setMatrixDoctorId] = useState<string>('');
  const [matrixDate, setMatrixDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [matrixSlots, setMatrixSlots] = useState<SlotAvailability[]>([]);
  const [matrixLoading, setMatrixLoading] = useState<boolean>(false);

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('09:00 AM');
  const [appointmentType, setAppointmentType] = useState<'ONLINE' | 'OFFLINE'>(
    role === 'PATIENT' ? 'ONLINE' : 'OFFLINE'
  );
  const [symptoms, setSymptoms] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [modalSlots, setModalSlots] = useState<SlotAvailability[]>([]);
  const [modalSlotsLoading, setModalSlotsLoading] = useState<boolean>(false);

  // Status Action Loading State
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Initial Data Load
  useEffect(() => {
    loadBaseData();
  }, []);

  async function loadBaseData() {
    try {
      setLoading(true);
      const [apts, docs] = await Promise.all([
        appointmentService.getAppointments(),
        doctorService.getDoctors(),
      ]);
      setAppointments(apts);
      setDoctors(docs);

      if (docs.length > 0) {
        setMatrixDoctorId(docs[0].id);
        setSelectedDoctorId(docs[0].id);
      }

      // If receptionist or admin, load patients list for walk-in booking
      if (role === 'RECEPTIONIST' || role === 'ADMIN') {
        const pats = await patientService.getPatients();
        setPatients(pats);
        if (pats.length > 0) {
          setSelectedPatientId(pats[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load appointments roster:', err);
    } finally {
      setLoading(false);
    }
  }

  // Load Availability Matrix whenever doctor or date changes
  useEffect(() => {
    if (matrixDoctorId && matrixDate) {
      fetchMatrixAvailability(matrixDoctorId, matrixDate);
    }
  }, [matrixDoctorId, matrixDate]);

  async function fetchMatrixAvailability(docId: string, dt: string) {
    try {
      setMatrixLoading(true);
      const res = await appointmentService.getDoctorAvailability(docId, dt);
      setMatrixSlots(res.slots || []);
    } catch (err) {
      console.error('Failed to load doctor availability:', err);
    } finally {
      setMatrixLoading(false);
    }
  }

  // Load Modal Slots whenever doctor or date changes inside modal
  useEffect(() => {
    if (isModalOpen && selectedDoctorId && appointmentDate) {
      fetchModalAvailability(selectedDoctorId, appointmentDate);
    }
  }, [isModalOpen, selectedDoctorId, appointmentDate]);

  async function fetchModalAvailability(docId: string, dt: string) {
    try {
      setModalSlotsLoading(true);
      const res = await appointmentService.getDoctorAvailability(docId, dt);
      setModalSlots(res.slots || []);

      // Auto-select first available slot if current slot is booked
      const currentAvailable = res.slots.find(
        (s) => s.slot === selectedSlot && s.isAvailable
      );
      if (!currentAvailable) {
        const firstAvailable = res.slots.find((s) => s.isAvailable);
        if (firstAvailable) {
          setSelectedSlot(firstAvailable.slot);
        }
      }
    } catch (err) {
      console.error('Failed to load modal availability:', err);
    } finally {
      setModalSlotsLoading(false);
    }
  }

  const handleOpenBookingWithSlot = (slot: string) => {
    setSelectedDoctorId(matrixDoctorId);
    setAppointmentDate(matrixDate);
    setSelectedSlot(slot);
    setBookingError(null);
    setIsModalOpen(true);
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!selectedDoctorId || !symptoms.trim()) {
      setBookingError('Please enter a clinical symptom or reason for visit.');
      return;
    }

    if ((role === 'RECEPTIONIST' || role === 'ADMIN') && !selectedPatientId) {
      setBookingError('Please select a registered patient.');
      return;
    }

    setBookingLoading(true);
    try {
      const created = await appointmentService.createAppointment({
        doctorId: selectedDoctorId,
        patientId: role === 'PATIENT' ? undefined : selectedPatientId,
        appointmentDate,
        appointmentTime: selectedSlot,
        type: appointmentType,
        symptoms: symptoms.trim(),
        notes: notes.trim(),
      });

      // Update local appointments list
      setAppointments((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setSymptoms('');
      setNotes('');

      // Refresh availability matrices
      if (matrixDoctorId === selectedDoctorId && matrixDate === appointmentDate) {
        fetchMatrixAvailability(selectedDoctorId, appointmentDate);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Double-booking conflict: This slot is already booked. Please choose another slot.';
      setBookingError(msg);

      // Re-fetch availability in modal to reflect the conflict immediately
      fetchModalAvailability(selectedDoctorId, appointmentDate);
    } finally {
      setBookingLoading(false);
    }
  };

  // Status Action Handlers
  const handleCheckIn = async (aptId: string) => {
    try {
      setActionLoadingId(aptId);
      const updated = await appointmentService.checkIn(aptId);
      setAppointments((prev) => prev.map((a) => (a.id === aptId ? updated : a)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to check in patient');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleComplete = async (aptId: string) => {
    try {
      setActionLoadingId(aptId);
      const updated = await appointmentService.complete(aptId);
      setAppointments((prev) => prev.map((a) => (a.id === aptId ? updated : a)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete appointment');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (aptId: string) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this appointment? The consultation slot will be immediately released for other bookings.'
    );
    if (!confirmCancel) return;

    try {
      setActionLoadingId(aptId);
      const updated = await appointmentService.cancel(aptId, 'Cancelled by user');
      setAppointments((prev) => prev.map((a) => (a.id === aptId ? updated : a)));

      // Refresh matrix availability since slot has been released
      if (matrixDoctorId && matrixDate) {
        fetchMatrixAvailability(matrixDoctorId, matrixDate);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (filterType === 'ALL') return true;
      if (filterType === 'ONLINE' || filterType === 'OFFLINE') return apt.type === filterType;
      return apt.status === filterType;
    });
  }, [appointments, filterType]);

  const selectedDoctorObj = doctors.find((d) => d.id === matrixDoctorId);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Unified Online & Offline Scheduling
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Shared Availability Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Clinical Appointment Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Online patient tele-consultations and front-desk walk-in OPD tokens operate on the exact
            same doctor calendar. Double-booking is strictly prohibited by backend database locks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => {
              setBookingError(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            {role === 'RECEPTIONIST'
              ? 'Book Offline Walk-in'
              : role === 'PATIENT'
              ? 'Book Online Consultation'
              : 'Schedule Consultation'}
          </Button>
        </div>
      </div>

      {/* UNIFIED AVAILABILITY MATRIX */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              Doctor Consultation Slot Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live schedule for {selectedDoctorObj?.name || 'Selected Doctor'} on {matrixDate}. Click an
              available slot to reserve immediately.
            </p>
          </div>

          {/* Doctor and Date Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Attending Doctor
              </label>
              <select
                value={matrixDoctorId}
                onChange={(e) => setMatrixDoctorId(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Consultation Date
              </label>
              <input
                type="date"
                value={matrixDate}
                onChange={(e) => setMatrixDate(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="self-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchMatrixAvailability(matrixDoctorId, matrixDate)}
                title="Refresh Availability"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${matrixLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="font-semibold text-slate-700">Slot Status:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            <strong className="text-emerald-700">AVAILABLE</strong> (Open for booking)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-purple-600" />
            <strong className="text-purple-700">ONLINE</strong> (Tele-Consultation)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500" />
            <strong className="text-amber-800">OFFLINE</strong> (In-Person OPD Token)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-300" />
            <span className="text-slate-500">PAST TIME</span>
          </span>
        </div>

        {/* Slot Grid */}
        {matrixLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Checking real-time doctor availability across online and offline channels...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {matrixSlots.map((slotObj) => {
              const isAvail = slotObj.status === 'AVAILABLE';
              const isOnline = slotObj.status === 'ONLINE';
              const isOffline = slotObj.status === 'OFFLINE';
              const isPast = slotObj.status === 'PAST';

              return (
                <div
                  key={slotObj.slot}
                  onClick={() => {
                    if (isAvail) handleOpenBookingWithSlot(slotObj.slot);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isAvail
                      ? 'border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 hover:border-emerald-400 cursor-pointer shadow-2xs'
                      : isOnline
                      ? 'border-purple-200 bg-purple-50/60 cursor-not-allowed opacity-90'
                      : isOffline
                      ? 'border-amber-200 bg-amber-50/70 cursor-not-allowed opacity-90'
                      : 'border-slate-200 bg-slate-100/70 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-800">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {slotObj.slot}
                  </div>

                  <div className="mt-2">
                    {isAvail && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        AVAILABLE
                      </span>
                    )}

                    {isOnline && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                        <Video className="w-3 h-3 text-purple-600" />
                        ONLINE
                      </span>
                    )}

                    {isOffline && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                        <Building className="w-3 h-3 text-amber-600" />
                        OFFLINE
                      </span>
                    )}

                    {isPast && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                        PAST
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-500 mt-1">
                    {isAvail
                      ? 'Click to reserve'
                      : isOnline
                      ? 'Tele-consult'
                      : isOffline
                      ? 'OPD Token'
                      : 'Elapsed'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'ONLINE', 'OFFLINE', 'CANCELLED'].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === tab
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong>{filteredAppointments.length}</strong> appointments
        </div>
      </div>

      {/* APPOINTMENTS ROSTER LIST */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading hospital consultation roster from database...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No consultations registered under the selected criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider leading-none">
                      Token
                    </span>
                    <span className="text-base font-bold leading-none mt-1">
                      #{apt.tokenNumber}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{apt.patientName}</h3>
                      <Badge variant="blue" size="sm">
                        {apt.patientMRN}
                      </Badge>

                      {apt.type === 'ONLINE' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          <Video className="w-3 h-3" /> Online Consultation
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <Building className="w-3 h-3" /> Offline OPD Token
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400">
                        Booked via {apt.bookedByRole || 'PORTAL'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1">
                      Doctor: <span className="font-semibold text-slate-800">{apt.doctorName}</span>{' '}
                      ({apt.doctorSpecialty})
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {apt.appointmentDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {apt.timeSlot}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      <span className="font-medium text-slate-700">Symptoms:</span>{' '}
                      {apt.symptoms || apt.reason}
                    </p>
                  </div>
                </div>

                {/* Status Badges and Workflow Controls */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <Badge
                    variant={
                      apt.status === 'COMPLETED'
                        ? 'green'
                        : apt.status === 'CHECKED_IN'
                        ? 'blue'
                        : apt.status === 'CONFIRMED'
                        ? 'blue'
                        : apt.status === 'CANCELLED'
                        ? 'red'
                        : 'amber'
                    }
                  >
                    {apt.status}
                  </Badge>

                  {/* Role Specific Actions */}
                  <div className="flex items-center gap-1.5 ml-2">
                    {/* Receptionist can Check-In offline or online patients arriving at OPD */}
                    {(role === 'RECEPTIONIST' || role === 'ADMIN') &&
                      apt.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCheckIn(apt.id)}
                          isLoading={actionLoadingId === apt.id}
                          title="Check In Patient at Front Desk"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                          Check In
                        </Button>
                      )}

                    {/* Attending Doctor or Admin can mark completed */}
                    {(role === 'DOCTOR' || role === 'ADMIN') &&
                      (apt.status === 'CONFIRMED' || apt.status === 'CHECKED_IN') && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleComplete(apt.id)}
                          isLoading={actionLoadingId === apt.id}
                          title="Complete Consultation"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Complete
                        </Button>
                      )}

                    {/* Cancellation releases slot */}
                    {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(apt.id)}
                        isLoading={actionLoadingId === apt.id}
                        title="Cancel Appointment & Free Consultation Slot"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SCHEDULE APPOINTMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {role === 'RECEPTIONIST'
                    ? 'Register OPD Walk-In Token'
                    : role === 'PATIENT'
                    ? 'Schedule Online Consultation'
                    : 'Schedule Hospital Consultation'}
                </h2>
                <p className="text-xs text-slate-500">
                  Slots are locked in real-time. Double-booking is strictly prohibited.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Conflict / Validation Error Banner */}
            {bookingError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Booking Conflict</strong>
                  <span>{bookingError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleBookAppointment} className="space-y-4 mt-4">
              {/* Doctor Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attending Doctor
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.specialization} (Fee: ₹{doc.consultationFee})
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Selector (For RECEPTIONIST and ADMIN) */}
              {(role === 'RECEPTIONIST' || role === 'ADMIN') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Patient
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    {patients.map((pat) => (
                      <option key={pat.id} value={pat.id}>
                        {pat.name} ({pat.medicalRecordNumber}) • {pat.phone}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Patient Identity notice for PATIENT role */}
              {role === 'PATIENT' && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>
                    Booking as <strong>{user?.name}</strong> ({user?.email})
                  </span>
                </div>
              )}

              {/* Date & Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Consultation Date
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Consultation Mode
                  </label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="ONLINE">Online (Tele-Health Video)</option>
                    <option value="OFFLINE">Offline (In-Person OPD)</option>
                  </select>
                </div>
              </div>

              {/* Consultation Slot Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Consultation Time Slot
                  </label>
                  {modalSlotsLoading && (
                    <span className="text-[10px] text-blue-600 flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Checking slot availability...
                    </span>
                  )}
                </div>

                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  {HOSPITAL_CONSULTATION_SLOTS.map((slot) => {
                    const statusObj = modalSlots.find((s) => s.slot === slot);
                    const isAvailable = statusObj ? statusObj.isAvailable : true;
                    const statusText = statusObj ? statusObj.status : 'AVAILABLE';

                    return (
                      <option
                        key={slot}
                        value={slot}
                        disabled={!isAvailable}
                        className={!isAvailable ? 'text-slate-400 bg-slate-100' : 'text-slate-900'}
                      >
                        {slot} {isAvailable ? '— AVAILABLE' : `— BOOKED (${statusText})`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Symptoms / Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chief Symptoms / Reason for Visit
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your current symptoms or reason for consulting the doctor..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={bookingLoading}>
                  Confirm & Reserve Slot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
