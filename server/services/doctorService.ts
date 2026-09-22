import { Doctor, IDoctor } from '../models/Doctor';
import { isMongoConnected } from '../config/db';
import { hospitalStore } from './storeService';

export const doctorService = {
  async getAllDoctors(filter: { department?: string; status?: string; availableOnly?: boolean } = {}) {
    if (isMongoConnected()) {
      const query: any = {};
      if (filter.department) {
        query.department = new RegExp(filter.department, 'i');
      }
      if (filter.status) {
        query.status = filter.status;
      }
      if (filter.availableOnly) {
        query.status = 'AVAILABLE';
      }

      const doctors = await Doctor.find(query).populate('userId', 'name email phone avatar');
      return doctors.map((doc: any) => ({
        id: doc._id.toString(),
        userId: doc.userId?._id?.toString() || doc.userId?.toString(),
        name: doc.userId?.name || 'Dr. Specialist',
        email: doc.userId?.email || '',
        specialization: doc.specialization,
        department: doc.department,
        qualification: doc.qualification,
        experienceYears: doc.experience,
        experience: doc.experience,
        consultationFee: doc.consultationFee,
        availableDays: doc.availability?.days || [],
        timeSlots: doc.availability?.slots || [],
        availability: doc.availability,
        roomNumber: doc.roomNumber,
        status: doc.status,
        isAvailable: doc.status === 'AVAILABLE',
        profileImage: doc.profileImage || doc.userId?.avatar,
      }));
    }

    // Fallback store
    let list = [...hospitalStore.doctors];
    if (filter.department) {
      list = list.filter((d) => d.department.toLowerCase() === filter.department?.toLowerCase());
    }
    if (filter.availableOnly) {
      list = list.filter((d) => d.isAvailable);
    }
    return list;
  },

  async getDoctorById(id: string) {
    if (isMongoConnected()) {
      const doc: any = await Doctor.findById(id).populate('userId', 'name email phone avatar');
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        userId: doc.userId?._id?.toString() || doc.userId?.toString(),
        name: doc.userId?.name || 'Dr. Specialist',
        email: doc.userId?.email || '',
        specialization: doc.specialization,
        department: doc.department,
        qualification: doc.qualification,
        experienceYears: doc.experience,
        experience: doc.experience,
        consultationFee: doc.consultationFee,
        availableDays: doc.availability?.days || [],
        timeSlots: doc.availability?.slots || [],
        availability: doc.availability,
        roomNumber: doc.roomNumber,
        status: doc.status,
        isAvailable: doc.status === 'AVAILABLE',
        profileImage: doc.profileImage || doc.userId?.avatar,
      };
    }

    return hospitalStore.doctors.find((d) => d.id === id) || null;
  },

  async createDoctor(data: Partial<IDoctor>) {
    if (isMongoConnected()) {
      const created = await Doctor.create(data);
      return await Doctor.findById(created._id).populate('userId', 'name email phone avatar');
    }

    const mockDoctor = {
      id: `doc-${Date.now().toString().slice(-4)}`,
      userId: data.userId?.toString() || 'usr-mock',
      name: 'Dr. Physician',
      email: 'doctor@rhms.local',
      specialization: data.specialization || 'General',
      department: data.department || 'Medicine',
      qualification: data.qualification || 'MBBS',
      experienceYears: data.experience || 5,
      consultationFee: data.consultationFee || 500,
      availableDays: data.availability?.days || ['Monday', 'Wednesday'],
      timeSlots: data.availability?.slots || ['10:00 AM - 11:00 AM'],
      roomNumber: data.roomNumber || 'OPD-101',
      isAvailable: data.status === 'AVAILABLE',
    };
    hospitalStore.doctors.push(mockDoctor);
    return mockDoctor;
  },
};
