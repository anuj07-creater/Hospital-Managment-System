import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMedicalRecord extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  diagnosis: string;
  notes: string;
  date: Date;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const medicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required for medical record'],
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Attending doctor reference is required'],
      index: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      index: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Clinical diagnosis or assessment is required'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    attachments: {
      type: [String],
      default: [],
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

medicalRecordSchema.index({ patientId: 1, date: -1 });

// Compatibility aliases
medicalRecordSchema.virtual('title').get(function () {
  return this.diagnosis;
});
medicalRecordSchema.virtual('description').get(function () {
  return this.notes;
});

export const MedicalRecord: Model<IMedicalRecord> =
  (mongoose.models.MedicalRecord as Model<IMedicalRecord>) ||
  mongoose.model<IMedicalRecord>('MedicalRecord', medicalRecordSchema);
