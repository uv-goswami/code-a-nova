import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Card } from './ui/Card';

const points = ['Verify your email with a one-time code', 'Register solo or with up to 4 teammates', 'Get a confirmation email with your team details'];

/** Shared two-column layout for Signup / OTP / Login. The side panel is a flat colour block. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="bg-surface py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-line bg-white shadow-card md:grid-cols-5">
        <aside className="hidden bg-primary p-8 text-white md:col-span-2 md:block">
          <h2 className="text-2xl font-bold">Join the Code-a-Nova Hackathon</h2>
          <p className="mt-2 text-sm text-white/80">Build something people will use.</p>
          <ul className="mt-8 space-y-4 text-sm">
            {points.map((p) => (
              <li key={p} className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-ink"><Check className="size-3.5" aria-hidden /></span>
                {p}
              </li>
            ))}
          </ul>
        </aside>
        <Card className="rounded-none border-0 p-6 shadow-none sm:p-10 md:col-span-3">
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </Card>
      </div>
    </section>
  );
}
