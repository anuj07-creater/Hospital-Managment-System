import mongoose, { Document, Schema, Model } from 'mongoose';

export type BloodGroupType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
export type GenderType = 'MALE' | 'FEMALE' | 'OTHER';

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface IPatient extends Document {
  userId: mongoose.Types.ObjectId;
  medicalRecordNumber: string; // Unique hospital MRN (e.g., MRN-2026-0042)
  age: number;
  gender: GenderType;
  bloodGroup: BloodGroupType;
  phone: string;
  address: string;
  allergies: string[];
  medicalHistory: string[];
  emergencyContact: IEmergencyContact;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required for Patient record'],
      unique: true,
      index: true,
    },
    medicalRecordNumber: {
      type: String,
      required: [true, 'Medical Record Number (MRN) is required'],
      unique: true,
      index: true,
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [0, 'Age cannot be negative'],
      max: [130, 'Please enter a realistic age'],
    },
    gender: {
      type: String,
      enum: {
        values: ['MALE', 'FEMALE', 'OTHER'],
        message: '{VALUE} is not a valid gender',
      },
      required: [true, 'Gender is required'],
      default: 'OTHER',
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
        message: '{VALUE} is not a supported blood group',
      },
      default: 'Unknown',
    },
    phone: {
      type: String,
      required: [true, 'Patient contact phone is required'],
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    allergies: {
      type: [String],
      default: [],
    },
    medicalHistory: {
      type: [String],
      default: [],
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
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

// Virtual for backward compatibility with dateOfBirth/chronicConditions
patientSchema.virtual('chronicConditions').get(function () {
  return this.medicalHistory || [];
});

export const Patient: Model<IPatient> =
  (mongoose.models.Patient as Model<IPatient>) || mongoose.model<IPatient>('Patient', patientSchema);
