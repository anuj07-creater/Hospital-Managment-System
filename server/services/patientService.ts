import { Patient, IPatient } from '../models/Patient';
import { User } from '../models/User';
import { isMongoConnected } from '../config/db';
import { hospitalStore } from './storeService';

export const patientService = {
  async getAllPatients(search?: string) {
    if (isMongoConnected()) {
      let query: any = {};
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query = {
          $or: [
            { medicalRecordNumber: regex },
            { phone: regex },
          ],
        };
      }

      const patients = await Patient.find(query).populate('userId', 'name email phone avatar');
      return patients.map((pat: any) => ({
        id: pat._id.toString(),
        userId: pat.userId?._id?.toString() || pat.userId?.toString(),
        medicalRecordNumber: pat.medicalRecordNumber,
        name: pat.userId?.name || 'Registered Patient',
        email: pat.userId?.email || '',
        phone: pat.phone || pat.userId?.phone || '',
        bloodGroup: pat.bloodGroup,
        gender: pat.gender,
        age: pat.age,
        address: pat.address,
        emergencyContact: pat.emergencyContact,
        allergies: pat.allergies,
        medicalHistory: pat.medicalHistory,
        chronicConditions: pat.medicalHistory,
        createdAt: pat.createdAt,
      }));
    }

    let list = [...hospitalStore.patients];
    if (search && search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.medicalRecordNumber.toLowerCase().includes(q) ||
          p.phone.includes(q)
      );
    }
    return list;
  },

  async getPatientById(id: string) {
    if (isMongoConnected()) {
      const pat: any = await Patient.findById(id).populate('userId', 'name email phone avatar');
      if (!pat) return null;
      return {
        id: pat._id.toString(),
        userId: pat.userId?._id?.toString() || pat.userId?.toString(),
        medicalRecordNumber: pat.medicalRecordNumber,
        name: pat.userId?.name || 'Registered Patient',
        email: pat.userId?.email || '',
        phone: pat.phone || pat.userId?.phone || '',
        bloodGroup: pat.bloodGroup,
        gender: pat.gender,
        age: pat.age,
        address: pat.address,
        emergencyContact: pat.emergencyContact,
        allergies: pat.allergies,
        medicalHistory: pat.medicalHistory,
        chronicConditions: pat.medicalHistory,
        createdAt: pat.createdAt,
      };
    }

    return hospitalStore.patients.find((p) => p.id === id) || null;
  },

  async createPatient(data: {
    name: string;
    phone: string;
    email?: string;
    bloodGroup?: any;
    gender?: any;
    age?: number;
    address?: string;
    allergies?: string[];
    medicalHistory?: string[];
    emergencyContact?: any;
    userId?: string;
  }) {
    if (isMongoConnected()) {
      // If no userId, create a linked User first
      let linkedUserId = data.userId;
      if (!linkedUserId) {
        const dummyEmail = data.email || `patient.${Date.now()}@rhms.local`;
        const user = await User.create({
          name: data.name,
          email: dummyEmail,
          password: 'patient_default_secret_123',
          role: 'PATIENT',
          phone: data.phone,
        });
        linkedUserId = user._id.toString();
      }

      // Generate distinct hospital MRN
      const count = await Patient.countDocuments();
      const mrn = `MRN-2026-${(count + 101).toString().padStart(4, '0')}`;

      const created = await Patient.create({
        userId: linkedUserId,
        medicalRecordNumber: mrn,
        age: data.age || 30,
        gender: data.gender || 'OTHER',
        bloodGroup: data.bloodGroup || 'Unknown',
        phone: data.phone,
        address: data.address || '',
        allergies: data.allergies || [],
        medicalHistory: data.medicalHistory || [],
        emergencyContact: data.emergencyContact || { name: '', relationship: '', phone: '' },
      });

      return await this.getPatientById(created._id.toString());
    }

    const newPat = {
      id: `pat-${Date.now().toString().slice(-4)}`,
      userId: `usr-${Date.now().toString().slice(-4)}`,
      medicalRecordNumber: `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      bloodGroup: data.bloodGroup || 'B+',
      gender: data.gender || 'MALE',
      dateOfBirth: '2000-01-01',
      emergencyContact: data.emergencyContact || { name: '', relationship: '', phone: '' },
      address: data.address || '',
      allergies: data.allergies || [],
      chronicConditions: data.medicalHistory || [],
      createdAt: new Date().toISOString(),
    };
    hospitalStore.patients.unshift(newPat);
    return newPat;
  },
};
