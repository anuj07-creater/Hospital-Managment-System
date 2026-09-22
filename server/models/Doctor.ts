import mongoose, { Document, Schema, Model } from 'mongoose';

export type DoctorStatus = 'AVAILABLE' | 'BUSY' | 'ON_LEAVE';

export interface IDoctorAvailability {
  days: string[];
  slots: string[];
}

export interface IDoctor extends Document {
  userId: mongoose.Types.ObjectId;
  specialization: string;
  department: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  availability: IDoctorAvailability;
  profileImage: string;
  status: DoctorStatus;
  roomNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required for Doctor'],
      unique: true,
      index: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      index: true,
    },
    department: {
      type: String,
      default: 'General Medicine',
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required (e.g. MBBS, MD)'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
      default: 1,
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Consultation fee cannot be negative'],
    },
    availability: {
      days: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      slots: {
        type: [String],
        default: [
          '09:00 AM - 10:00 AM',
          '10:00 AM - 11:00 AM',
          '11:30 AM - 12:30 PM',
          '02:00 PM - 03:00 PM',
          '04:00 PM - 05:00 PM',
        ],
      },
    },
    profileImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['AVAILABLE', 'BUSY', 'ON_LEAVE'],
        message: '{VALUE} is not a valid doctor status',
      },
      default: 'AVAILABLE',
      index: true,
    },
    roomNumber: {
      type: String,
      default: 'OPD-101',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual for backward compatibility with frontend expecting experienceYears
doctorSchema.virtual('experienceYears').get(function () {
  return this.experience;
});

// Virtual for backward compatibility with frontend expecting availableDays / timeSlots
doctorSchema.virtual('availableDays').get(function () {
  return this.availability?.days || [];
});

doctorSchema.virtual('timeSlots').get(function () {
  return this.availability?.slots || [];
});

doctorSchema.virtual('isAvailable').get(function () {
  return this.status === 'AVAILABLE';
});

export const Doctor: Model<IDoctor> =
  (mongoose.models.Doctor as Model<IDoctor>) || mongoose.model<IDoctor>('Doctor', doctorSchema);
