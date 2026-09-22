import bcrypt from 'bcryptjs';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT';
  phone: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface StoredDoctor {
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

export interface StoredPatient {
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

export interface StoredAppointment {
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
  type: 'ONLINE' | 'OFFLINE';
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  symptoms: string;
  reason?: string;
  notes?: string;
  tokenNumber: number;
  bookedByRole: string;
  createdAt: string;
}

class InMemoryHospitalStore {
  public users: StoredUser[] = [];
  public doctors: StoredDoctor[] = [];
  public patients: StoredPatient[] = [];
  public appointments: StoredAppointment[] = [];

  constructor() {
    this.seedDefaults();
  }

  public seedDefaults() {
    const salt = bcrypt.genSaltSync(10);

    // Seed 4 Users for the 4 User Roles
    this.users = [
      {
        id: 'usr-admin-01',
        name: 'Dr. Anand Raut',
        email: 'admin@raut-hospital.org',
        passwordHash: bcrypt.hashSync('admin123', salt),
        role: 'ADMIN',
        phone: '+91 98200 11223',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: '2026-01-10T08:00:00.000Z',
      },
      {
        id: 'usr-doc-01',
        name: 'Dr. Sarah Sharma',
        email: 'dr.sarah@raut-hospital.org',
        passwordHash: bcrypt.hashSync('doctor123', salt),
        role: 'DOCTOR',
        phone: '+91 98200 44556',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: '2026-01-12T09:30:00.000Z',
      },
      {
        id: 'usr-doc-02',
        name: 'Dr. Rajesh Patel',
        email: 'dr.rajesh@raut-hospital.org',
        passwordHash: bcrypt.hashSync('doctor123', salt),
        role: 'DOCTOR',
        phone: '+91 98200 77889',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: '2026-01-15T11:00:00.000Z',
      },
      {
        id: 'usr-rec-01',
        name: 'Pooja Verma',
        email: 'reception@raut-hospital.org',
        passwordHash: bcrypt.hashSync('reception123', salt),
        role: 'RECEPTIONIST',
        phone: '+91 98200 99001',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: '2026-01-20T08:15:00.000Z',
      },
      {
        id: 'usr-pat-01',
        name: 'Rahul Kulkarni',
        email: 'patient.rahul@gmail.com',
        passwordHash: bcrypt.hashSync('patient123', salt),
        role: 'PATIENT',
        phone: '+91 98900 12345',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: '2026-02-01T10:00:00.000Z',
      },
    ];

    // Seed Doctors Profiles
    this.doctors = [
      {
        id: 'doc-001',
        userId: 'usr-doc-01',
        name: 'Dr. Sarah Sharma',
        email: 'dr.sarah@raut-hospital.org',
        specialization: 'Senior Cardiologist',
        department: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experienceYears: 12,
        consultationFee: 800,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: ['09:00 AM - 10:00 AM', '10:30 AM - 11:30 AM', '02:00 PM - 03:00 PM', '04:00 PM - 05:00 PM'],
        roomNumber: 'OPD-204 (Cardio Wing)',
        isAvailable: true,
      },
      {
        id: 'doc-002',
        userId: 'usr-doc-02',
        name: 'Dr. Rajesh Patel',
        email: 'dr.rajesh@raut-hospital.org',
        specialization: 'Orthopedic Surgeon',
        department: 'Orthopedics',
        qualification: 'MBBS, MS (Ortho), Fellowship Arthroscopy',
        experienceYears: 15,
        consultationFee: 750,
        availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        timeSlots: ['10:00 AM - 11:00 AM', '11:30 AM - 12:30 PM', '03:00 PM - 04:00 PM'],
        roomNumber: 'OPD-108 (Joint Care)',
        isAvailable: true,
      },
    ];

    // Seed Patients
    this.patients = [
      {
        id: 'pat-001',
        userId: 'usr-pat-01',
        name: 'Rahul Kulkarni',
        email: 'patient.rahul@gmail.com',
        phone: '+91 98900 12345',
        medicalRecordNumber: 'MRN-2026-0101',
        bloodGroup: 'B+',
        dateOfBirth: '1989-05-14',
        gender: 'MALE',
        address: 'Flat 402, Green Meadows, Shivajinagar, Pune',
        emergencyContact: {
          name: 'Sunita Kulkarni',
          relationship: 'Spouse',
          phone: '+91 98900 67890',
        },
        allergies: ['Penicillin'],
        chronicConditions: ['Mild Hypertension'],
        createdAt: '2026-02-01T10:00:00.000Z',
      },
      {
        id: 'pat-002',
        userId: 'usr-walkin-02',
        name: 'Anita Desai',
        email: 'anita.desai@example.com',
        phone: '+91 98221 44332',
        medicalRecordNumber: 'MRN-2026-0102',
        bloodGroup: 'O+',
        dateOfBirth: '1995-11-23',
        gender: 'FEMALE',
        address: 'B-12, Orchid Towers, Kothrud, Pune',
        emergencyContact: {
          name: 'Vikas Desai',
          relationship: 'Brother',
          phone: '+91 98221 99887',
        },
        allergies: ['None reported'],
        chronicConditions: [],
        createdAt: '2026-02-10T14:30:00.000Z',
      },
    ];

    // Seed Appointments
    this.appointments = [
      {
        id: 'apt-2026-001',
        patientId: 'pat-001',
        patientName: 'Rahul Kulkarni',
        patientMRN: 'MRN-2026-0101',
        doctorId: 'doc-001',
        doctorName: 'Dr. Sarah Sharma',
        doctorSpecialty: 'Cardiology',
        appointmentDate: '2026-09-23',
        timeSlot: '10:30 AM - 11:30 AM',
        type: 'OFFLINE',
        status: 'CONFIRMED',
        symptoms: 'Mild chest tightness on brisk walking and routine fatigue',
        notes: 'Requested ECG prior to consultation',
        tokenNumber: 4,
        bookedByRole: 'PATIENT',
        createdAt: '2026-09-20T09:15:00.000Z',
      },
      {
        id: 'apt-2026-002',
        patientId: 'pat-002',
        patientName: 'Anita Desai',
        patientMRN: 'MRN-2026-0102',
        doctorId: 'doc-002',
        doctorName: 'Dr. Rajesh Patel',
        doctorSpecialty: 'Orthopedics',
        appointmentDate: '2026-09-23',
        timeSlot: '11:30 AM - 12:30 PM',
        type: 'OFFLINE',
        status: 'PENDING',
        symptoms: 'Right knee joint pain after badminton practice',
        tokenNumber: 2,
        bookedByRole: 'RECEPTIONIST',
        createdAt: '2026-09-22T08:00:00.000Z',
      },
      {
        id: 'apt-2026-003',
        patientId: 'pat-001',
        patientName: 'Rahul Kulkarni',
        patientMRN: 'MRN-2026-0101',
        doctorId: 'doc-001',
        doctorName: 'Dr. Sarah Sharma',
        doctorSpecialty: 'Cardiology',
        appointmentDate: '2026-09-15',
        timeSlot: '09:00 AM - 10:00 AM',
        type: 'ONLINE',
        status: 'COMPLETED',
        symptoms: 'Follow-up on BP readings and medication adjustment',
        tokenNumber: 1,
        bookedByRole: 'PATIENT',
        createdAt: '2026-09-10T12:00:00.000Z',
      },
    ];
  }
}

export const hospitalStore = new InMemoryHospitalStore();
