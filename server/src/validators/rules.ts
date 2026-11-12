// Zod validators for rules that OpenAPI/JSON-Schema CANNOT express at runtime (ADR-0013):
//   - password == confirmPassword
//   - teamMembers.length == teamSize - 1, unique member emails, member != leader
//   - registration email == account email
//   - host allow-lists for PPT / demo-video links
//   - JWT payload shape
// Everything else (types, formats, enums, lengths, patterns) is validated by openapi.yaml.
import { z } from 'zod';
import { ApiError, type ErrorDetail } from '../utils/ApiError';
import { isPptLink, isVideoLink } from '../utils/linkValidator';

const toDetails = (error: z.ZodError): ErrorDetail[] =>
  error.issues.map((issue) => ({ field: issue.path.join('.') || 'body', message: issue.message }));

// ---- signup ----
const passwordsMatchSchema = z
  .object({ password: z.string(), confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password and confirm password do not match',
    path: ['confirmPassword'],
  });

export function assertPasswordsMatch(input: { password: string; confirmPassword: string }): void {
  const result = passwordsMatchSchema.safeParse(input);
  if (!result.success) {
    throw ApiError.badRequest('PASSWORD_MISMATCH', 'Password and confirm password do not match', toDetails(result.error));
  }
}

// ---- hackathon registration (ADR-0006 team semantics) ----
const registrationRulesSchema = (accountEmail: string) =>
  z
    .object({
      email: z.string(),
      teamSize: z.number(),
      teamMembers: z.array(z.object({ name: z.string(), email: z.string() })).default([]),
      pptLink: z.string(),
      demoVideoLink: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const issue = (field: string, message: string) => ctx.addIssue({ code: 'custom', path: [field], message });

      if (data.email.trim().toLowerCase() !== accountEmail) issue('email', 'Email must match your account email');

      if (data.teamMembers.length !== data.teamSize - 1) {
        issue('teamMembers', `Team size ${data.teamSize} requires exactly ${data.teamSize - 1} additional member(s)`);
      }

      const everyone = [accountEmail, ...data.teamMembers.map((m) => m.email.trim().toLowerCase())];
      if (new Set(everyone).size !== everyone.length) {
        issue('teamMembers', 'Team member emails must be unique and different from yours');
      }

      if (!isPptLink(data.pptLink)) issue('pptLink', 'PPT link must be a Google Drive or OneDrive link');
      if (data.demoVideoLink && !isVideoLink(data.demoVideoLink)) {
        issue('demoVideoLink', 'Demo video must be a YouTube or Google Drive link');
      }
    });

export function assertRegistrationRules(
  accountEmail: string,
  input: { email: string; teamSize: number; teamMembers?: { name: string; email: string }[]; pptLink: string; demoVideoLink?: string }
): void {
  const result = registrationRulesSchema(accountEmail).safeParse(input);
  if (!result.success) {
    throw ApiError.badRequest('VALIDATION_ERROR', 'Request validation failed', toDetails(result.error));
  }
}

// ---- JWT payload (the signature proves who issued it; this proves its SHAPE) ----
export const tokenPayloadSchema = z.object({
  sub: z.string().min(1),
  role: z.enum(['participant', 'admin']),
});
export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
