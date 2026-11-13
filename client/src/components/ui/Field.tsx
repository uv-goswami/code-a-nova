import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface FieldShellProps { label: string; error?: string; hint?: string; optional?: boolean; id: string; children: ReactNode }

function FieldShell({ label, error, hint, optional, id, children }: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

const control = (error?: string) =>
  `w-full rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-surface disabled:text-muted read-only:bg-surface read-only:text-muted ${
    error ? 'border-danger' : 'border-line'
  }`;

interface Common { label: string; error?: string; hint?: string; optional?: boolean }

export function Input({ label, error, hint, optional, className = '', ...rest }: Common & ComponentProps<'input'>) {
  const id = useId();
  return (
    <FieldShell {...{ label, error, hint, optional, id }}>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={cn(control(error), 'h-11', className)} {...rest} />
    </FieldShell>
  );
}

export function Select({ label, error, hint, optional, options, placeholder = 'Select', className = '', ...rest }:
  Common & ComponentProps<'select'> & { options: readonly string[]; placeholder?: string }) {
  const id = useId();
  return (
    <FieldShell {...{ label, error, hint, optional, id }}>
      <select id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={cn(control(error), 'h-11', className)} {...rest}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </FieldShell>
  );
}

export function Textarea({ label, error, hint, optional, className = '', ...rest }: Common & ComponentProps<'textarea'>) {
  const id = useId();
  return (
    <FieldShell {...{ label, error, hint, optional, id }}>
      <textarea id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={cn(control(error), 'py-2.5', className)} {...rest} />
    </FieldShell>
  );
}
