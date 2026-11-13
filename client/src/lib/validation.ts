// Client-side Zod schemas: instant feedback only. The SERVER is the authority (OpenAPI + rules.ts)
// and its field errors are shown under the matching input. Dropdown values come from GET /meta/options.
import { z } from 'zod';

export const TEAM_MIN = 1;
export const TEAM_MAX = 5;
/** ADR-0006: team size includes the registrant, so extra member boxes = size - 1. Change ONLY here to flip the rule. */
export const memberBoxCount = (teamSize: number) => Math.max(0, teamSize - 1);

export const personNameSchema = z
  .string()
  .min(3, 'Enter at least 3 letters')
  .max(60, 'Keep it under 60 characters')
  .regex(/^(?=.*[A-Za-z])[A-Za-z ]+$/, 'Use letters and spaces only');
const personName = personNameSchema;
const email = z.email('Enter a valid email address').max(254);
const httpUrl = (label: string) =>
  z.url(`Enter a valid ${label} link`).refine((v) => /^https?:\/\//i.test(v), 'Link must start with http:// or https://');

export const signupSchema = z
  .object({
    fullName: personName,
    email,
    password: z
      .string()
      .min(8, 'Use at least 8 characters')
      .max(72, 'Use at most 72 characters')
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/\d/, 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });
export type SignupForm = z.infer<typeof signupSchema>;

export const loginSchema = z.object({ email, password: z.string().min(1, 'Enter your password') });
export type LoginForm = z.infer<typeof loginSchema>;

export const otpSchema = z.string().regex(/^\d{6}$/, 'Enter the 6-digit code');

export const contactSchema = z.object({
  name: z.string().min(2, 'Enter your name').max(60),
  email,
  message: z.string().min(10, 'Write at least 10 characters').max(2000, 'Keep it under 2000 characters'),
});
export type ContactForm = z.infer<typeof contactSchema>;

const required = (label: string) => z.string().min(1, `Select your ${label}`);

export const registrationSchema = z
  .object({
    fullName: personName,
    email,
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    college: required('college'),
    course: required('course'),
    branch: required('branch'),
    yearOfStudy: required('year of study'),
    domain: required('domain / track'),
    projectName: z.string().min(5, 'Project name needs at least 5 characters').max(100),
    pptLink: httpUrl('PPT'),
    prototypeLink: httpUrl('prototype'),
    demoVideoLink: z.union([z.literal(''), httpUrl('demo video')]),
    teamSize: z.number({ error: 'Select team size' }).int().min(TEAM_MIN).max(TEAM_MAX),
    teamMembers: z.array(z.object({ name: personName, email })),
  })
  .superRefine((d, ctx) => {
    const emails = [d.email, ...d.teamMembers.map((m) => m.email)].map((e) => e.trim().toLowerCase());
    d.teamMembers.forEach((m, i) => {
      const mine = m.email.trim().toLowerCase();
      if (emails.indexOf(mine) !== emails.lastIndexOf(mine) || mine === d.email.trim().toLowerCase()) {
        ctx.addIssue({ code: 'custom', path: ['teamMembers', i, 'email'], message: 'Each member needs a unique email' });
      }
    });
  });
export type RegistrationForm = z.infer<typeof registrationSchema>;
