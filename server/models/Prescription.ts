import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMedicineItem {
  name: string;
  dosage: string; // e.g. "500mg"
  frequency: string; // e.g. "1-0-1 (After Food)"
  duration: string; // e.g. "5 Days"
  instructions?: string;
}

export interface IPrescription extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  diagnosis: string;
  medicines: IMedicineItem[];
  instructions: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const prescriptionSchema = new Schema<IPrescription>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required for prescription'],
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required for prescription'],
      index: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required for prescription'],
      index: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Clinical diagnosis is required'],
      trim: true,
    },
    medicines: [
      {
        name: { type: String, required: [true, 'Medicine name is required'], trim: true },
        dosage: { type: String, required: [true, 'Dosage is required (e.g. 500mg)'], trim: true },
        frequency: { type: String, required: [true, 'Frequency is required (e.g. 1-0-1)'], trim: true },
        duration: { type: String, required: [true, 'Duration is required (e.g. 5 days)'], trim: true },
        instructions: { type: String, default: '' },
      },
    ],
    instructions: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
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

// Compatibility virtuals
prescriptionSchema.virtual('advice').get(function () {
  return this.instructions;
});

export const Prescription: Model<IPrescription> =
  (mongoose.models.Prescription as Model<IPrescription>) ||
  mongoose.model<IPrescription>('Prescription', prescriptionSchema);
