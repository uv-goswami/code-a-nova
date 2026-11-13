import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const styles = {
  error: { box: 'border-danger/30 bg-danger-50 text-danger', Icon: AlertCircle },
  success: { box: 'border-success/30 bg-success-50 text-success', Icon: CheckCircle2 },
  info: { box: 'border-primary/20 bg-primary-50 text-primary', Icon: Info },
} as const;

export function Alert({ kind = 'info', children }: { kind?: keyof typeof styles; children: ReactNode }) {
  const { box, Icon } = styles[kind];
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`flex gap-2 rounded-lg border px-3 py-2.5 text-sm ${box}`}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
