import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { options } from '../config/openapi';

export interface ITeamMember {
  name: string;
  email: string;
}

export interface IRegistration {
  user: Types.ObjectId;
  fullName: string;
  email: string;
  mobile: string;
  college: string;
  course: string;
  branch: string;
  yearOfStudy: string;
  domain: string;
  projectName: string;
  pptLink: string;
  prototypeLink: string;
  demoVideoLink: string | null;
  teamSize: number;
  teamMembers: ITeamMember[];
  createdAt: Date;
  updatedAt: Date;
}
export type RegistrationDocument = HydratedDocument<IRegistration>;

const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { _id: false }
);

const registrationSchema = new Schema<IRegistration>(
  {
    // unique => one registration per user, enforced by the database (race-safe)
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String, required: true },
    college: { type: String, required: true, enum: options.colleges },
    course: { type: String, required: true, enum: options.courses },
    branch: { type: String, required: true, enum: options.branches },
    yearOfStudy: { type: String, required: true, enum: options.yearsOfStudy },
    domain: { type: String, required: true, enum: options.domains },
    projectName: { type: String, required: true, trim: true },
    pptLink: { type: String, required: true },
    prototypeLink: { type: String, required: true },
    demoVideoLink: { type: String, default: null },
    teamSize: { type: Number, required: true, min: options.teamSize.min, max: options.teamSize.max },
    teamMembers: { type: [teamMemberSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        ret.user = ret.user.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Registration = model<IRegistration>('Registration', registrationSchema);
