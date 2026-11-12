import { Schema, model, type HydratedDocument } from 'mongoose';

export type Role = 'participant' | 'admin';

export interface IUser {
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
  isVerified: boolean;
  otpHash?: string;
  otpExpiresAt?: Date;
  otpAttempts: number;
  otpLastSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
export type UserDocument = HydratedDocument<IUser>;

// Fields hidden from queries by default (select:false); request explicitly with .select(SENSITIVE_FIELDS).
export const SENSITIVE_FIELDS = '+passwordHash +otpHash +otpExpiresAt +otpAttempts +otpLastSentAt';

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['participant', 'admin'], default: 'participant' },
    isVerified: { type: Boolean, default: false },
    otpHash: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    otpLastSentAt: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      // Never leak secrets: strip password + OTP fields, map _id -> id.
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.otpHash;
        delete ret.otpExpiresAt;
        delete ret.otpAttempts;
        delete ret.otpLastSentAt;
        return ret;
      },
    },
  }
);

export const User = model<IUser>('User', userSchema);
