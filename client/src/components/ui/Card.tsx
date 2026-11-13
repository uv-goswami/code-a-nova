import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';

export function Card({ className = '', ...rest }: ComponentProps<'div'>) {
  return <div className={cn('rounded-xl border border-line bg-white shadow-card', className)} {...rest} />;
}

export function Badge({ tone = 'blue', children }: { tone?: 'blue' | 'green' | 'yellow' | 'grey'; children: React.ReactNode }) {
  const tones = {
    blue: 'bg-primary-50 text-primary',
    green: 'bg-success-50 text-success',
    yellow: 'bg-accent-50 text-[#8a6400]',
    grey: 'bg-surface text-muted',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-muted">
      <span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
      <span className="text-sm">{label}...</span>
    </div>
  );
}
