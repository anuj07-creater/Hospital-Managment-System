export type UserRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  email: string;
  specialization: string;
  department: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  availableDays: string[];
  timeSlots: string[];
  roomNumber: string;
  isAvailable: boolean;
}

export interface Patient {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  medicalRecordNumber: string;
  bloodGroup: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[];
  chronicConditions: string[];
  createdAt: string;
}

export type AppointmentType = 'ONLINE' | 'OFFLINE';
export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface SlotAvailability {
  slot: string;
  status: 'AVAILABLE' | 'ONLINE' | 'OFFLINE' | 'PAST';
  isAvailable: boolean;
  isPast: boolean;
  appointmentStatus?: AppointmentStatus;
}

export interface DoctorScheduleSlot {
  slot: string;
  status: 'AVAILABLE' | 'ONLINE' | 'OFFLINE' | 'PAST';
  isAvailable: boolean;
  isPast: boolean;
  appointment: {
    id: string;
    patientId: string;
    patientName: string;
    patientMRN: string;
    patientPhone?: string;
    type: AppointmentType;
    status: AppointmentStatus;
    reason: string;
    tokenNumber: number;
    bookedByRole: string;
  } | null;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  timeSlot: string;
  appointmentTime?: string;
  type: AppointmentType;
  status: AppointmentStatus;
  symptoms: string;
  reason?: string;
  notes?: string;
  tokenNumber: number;
  bookedByRole: string;
  createdAt: string;
}

export interface MedicineItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  medicines: MedicineItem[];
  advice?: string;
  followUpDate?: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorName?: string;
  recordType: 'LAB_REPORT' | 'DIAGNOSIS' | 'DISCHARGE_SUMMARY' | 'CLINICAL_NOTE';
  title: string;
  description: string;
  vitals?: {
    bloodPressure?: string;
    pulseRate?: string;
    temperature?: string;
    spO2?: string;
  };
  attachments?: string[];
  recordedDate: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}
