import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiRequestError } from '../api/client';

/**
 * Puts server-side field errors under the matching inputs.
 * Returns a message for the form-level alert when something could not be attached to a field.
 */
export function applyApiError<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
): string {
  if (!(err instanceof ApiRequestError)) return 'Something went wrong. Please try again.';

  if (err.code === 'EMAIL_ALREADY_REGISTERED' && fields.includes('email')) {
    setError('email' as Path<T>, { message: err.message });
    return '';
  }

  let unmapped = err.details.length === 0;
  for (const issue of err.details) {
    if (fields.includes(issue.field) || /^teamMembers\.\d+\.(name|email)$/.test(issue.field)) {
      setError(issue.field as Path<T>, { message: issue.message });
    } else {
      unmapped = true;
    }
  }
  return unmapped ? err.message : '';
}
