import { User } from '../models/User';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { Appointment } from '../models/Appointment';
import { Prescription } from '../models/Prescription';
import { MedicalRecord } from '../models/MedicalRecord';

export async function seedMongoDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`ℹ️  MongoDB already populated (${userCount} users present). Skipping initial seed.`);
      return;
    }

    console.log('🌱 Seeding initial Raut Hospital Management System demo dataset to MongoDB...');

    // 1. Create Core Users
    const adminUser = await User.create({
      name: 'Dr. Anand Raut',
      email: 'admin@raut-hospital.org',
      password: 'admin123',
      role: 'ADMIN',
      phone: '+91 98200 11223',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      isActive: true,
    });

    const docUser1 = await User.create({
      name: 'Dr. Sarah Sharma',
      email: 'dr.sarah@raut-hospital.org',
      password: 'doctor123',
      role: 'DOCTOR',
      phone: '+91 98200 44556',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      isActive: true,
    });

    const docUser2 = await User.create({
      name: 'Dr. Rajesh Patel',
      email: 'dr.rajesh@raut-hospital.org',
      password: 'doctor123',
      role: 'DOCTOR',
      phone: '+91 98200 77889',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      isActive: true,
    });

    const receptionistUser = await User.create({
      name: 'Pooja Verma',
      email: 'reception@raut-hospital.org',
      password: 'reception123',
      role: 'RECEPTIONIST',
      phone: '+91 98200 99001',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      isActive: true,
    });

    const patientUser1 = await User.create({
      name: 'Rahul Kulkarni',
      email: 'patient.rahul@gmail.com',
      password: 'patient123',
      role: 'PATIENT',
      phone: '+91 98900 12345',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isActive: true,
    });

    const patientUser2 = await User.create({
      name: 'Anita Desai',
      email: 'anita.desai@example.com',
      password: 'patient123',
      role: 'PATIENT',
      phone: '+91 98221 44332',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      isActive: true,
    });

    // 2. Create Doctors
    const doctor1 = await Doctor.create({
      userId: docUser1._id,
      specialization: 'Senior Cardiologist',
      department: 'Cardiology',
      qualification: 'MBBS, MD, DM (Cardiology)',
      experience: 12,
      consultationFee: 800,
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        slots: ['09:00 AM - 10:00 AM', '10:30 AM - 11:30 AM', '02:00 PM - 03:00 PM', '04:00 PM - 05:00 PM'],
      },
      profileImage: docUser1.avatar,
      status: 'AVAILABLE',
      roomNumber: 'OPD-204 (Cardio Wing)',
    });

    const doctor2 = await Doctor.create({
      userId: docUser2._id,
      specialization: 'Orthopedic Surgeon',
      department: 'Orthopedics',
      qualification: 'MBBS, MS (Ortho), Fellowship Arthroscopy',
      experience: 15,
      consultationFee: 750,
      availability: {
        days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        slots: ['10:00 AM - 11:00 AM', '11:30 AM - 12:30 PM', '03:00 PM - 04:00 PM'],
      },
      profileImage: docUser2.avatar,
      status: 'AVAILABLE',
      roomNumber: 'OPD-108 (Joint Care)',
    });

    // 3. Create Patients
    const patient1 = await Patient.create({
      userId: patientUser1._id,
      medicalRecordNumber: 'MRN-2026-0101',
      age: 36,
      gender: 'MALE',
      bloodGroup: 'B+',
      phone: '+91 98900 12345',
      address: 'Flat 402, Green Meadows, Shivajinagar, Pune',
      allergies: ['Penicillin'],
      medicalHistory: ['Mild Essential Hypertension', 'Hyperlipidemia'],
      emergencyContact: {
        name: 'Sunita Kulkarni',
        relationship: 'Spouse',
        phone: '+91 98900 67890',
      },
    });

    const patient2 = await Patient.create({
      userId: patientUser2._id,
      medicalRecordNumber: 'MRN-2026-0102',
      age: 29,
      gender: 'FEMALE',
      bloodGroup: 'O+',
      phone: '+91 98221 44332',
      address: 'B-12, Orchid Towers, Kothrud, Pune',
      allergies: ['None reported'],
      medicalHistory: ['Occasional sports injury strain'],
      emergencyContact: {
        name: 'Vikas Desai',
        relationship: 'Brother',
        phone: '+91 98221 99887',
      },
    });

    // 4. Create Appointments
    const apt1 = await Appointment.create({
      patientId: patient1._id,
      doctorId: doctor1._id,
      appointmentDate: '2026-09-23',
      appointmentTime: '10:30 AM - 11:30 AM',
      type: 'OFFLINE',
      status: 'CONFIRMED',
      reason: 'Mild chest tightness on brisk walking and routine fatigue',
      tokenNumber: 4,
      createdBy: patientUser1._id,
    });

    const apt2 = await Appointment.create({
      patientId: patient2._id,
      doctorId: doctor2._id,
      appointmentDate: '2026-09-23',
      appointmentTime: '11:30 AM - 12:30 PM',
      type: 'OFFLINE',
      status: 'CHECKED_IN',
      reason: 'Right knee joint pain after badminton practice',
      tokenNumber: 2,
      createdBy: receptionistUser._id,
    });

    const apt3 = await Appointment.create({
      patientId: patient1._id,
      doctorId: doctor1._id,
      appointmentDate: '2026-09-15',
      appointmentTime: '09:00 AM - 10:00 AM',
      type: 'ONLINE',
      status: 'COMPLETED',
      reason: 'Follow-up on BP readings and medication adjustment',
      tokenNumber: 1,
      createdBy: patientUser1._id,
    });

    // 5. Create Sample Prescription
    await Prescription.create({
      patientId: patient1._id,
      doctorId: doctor1._id,
      appointmentId: apt3._id,
      diagnosis: 'Stage 1 Hypertension - Controlled',
      medicines: [
        {
          name: 'Telmisartan 40mg',
          dosage: '40mg',
          frequency: '1-0-0 (Morning after breakfast)',
          duration: '30 Days',
          instructions: 'Monitor blood pressure weekly in logbook',
        },
        {
          name: 'Atorvastatin 10mg',
          dosage: '10mg',
          frequency: '0-0-1 (Night after dinner)',
          duration: '30 Days',
          instructions: 'Avoid grapefruits while on statins',
        },
      ],
      instructions: 'Low sodium diet, 30 min daily brisk walking. Follow up in 4 weeks.',
      date: new Date('2026-09-15T09:30:00.000Z'),
    });

    // 6. Create Sample Medical Record
    await MedicalRecord.create({
      patientId: patient1._id,
      doctorId: doctor1._id,
      appointmentId: apt3._id,
      diagnosis: 'Echocardiogram & Resting ECG: Normal Sinus Rhythm',
      notes: 'EF 60%, no regional wall motion abnormalities. Normal LV systolic function.',
      date: new Date('2026-09-15T10:00:00.000Z'),
    });

    console.log('✅ Raut Hospital Management System demo dataset seeded successfully into MongoDB Atlas.');
  } catch (err) {
    console.error('⚠️ Seeding MongoDB failed:', err);
  }
}
