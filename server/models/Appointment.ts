import mongoose, { Document, Schema, Model } from 'mongoose';

export type AppointmentType = 'ONLINE' | 'OFFLINE';
export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED';

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g., "10:00 AM - 10:30 AM"
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  tokenNumber: number;
  bookedByRole?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient ID reference is required'],
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID reference is required'],
      index: true,
    },
    appointmentDate: {
      type: String,
      required: [true, 'Appointment date is required (YYYY-MM-DD)'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time or slot is required'],
    },
    type: {
      type: String,
      enum: {
        values: ['ONLINE', 'OFFLINE'],
        message: '{VALUE} must be either ONLINE or OFFLINE',
      },
      default: 'OFFLINE',
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'],
        message: '{VALUE} is not a recognized appointment status',
      },
      default: 'PENDING',
    },
    reason: {
      type: String,
      required: [true, 'Reason for appointment / chief symptoms is required'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    tokenNumber: {
      type: Number,
      default: 1,
    },
    bookedByRole: {
      type: String,
      enum: ['PATIENT', 'RECEPTIONIST', 'ADMIN'],
      default: 'PATIENT',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User who booked this appointment is required'],
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

// High-performance query indexes
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

// Database-enforced double-booking prevention for active appointments
// Cancelled appointments are excluded from the unique index to immediately free the slot
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, appointmentTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED'] },
    },
  }
);

// Compatibility aliases for existing UI
appointmentSchema.virtual('symptoms').get(function (this: any) {
  return this.get ? this.get('reason') : this.reason;
});
appointmentSchema.virtual('timeSlot').get(function (this: any) {
  return this.get ? this.get('appointmentTime') : this.appointmentTime;
});
appointmentSchema.virtual('patient').get(function (this: any) {
  return this.get ? this.get('patientId') : this.patientId;
});
appointmentSchema.virtual('doctor').get(function (this: any) {
  return this.get ? this.get('doctorId') : this.doctorId;
});

export const Appointment: Model<IAppointment> =
  (mongoose.models.Appointment as Model<IAppointment>) ||
  mongoose.model<IAppointment>('Appointment', appointmentSchema);
