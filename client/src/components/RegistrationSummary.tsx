import { ExternalLink } from 'lucide-react';
import type { Registration } from '../types/api';
import { Badge } from './ui/Card';

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid gap-1 border-b border-line py-3 last:border-0 sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm text-muted">{label}</dt>
    <dd className="text-sm font-medium text-ink sm:col-span-2">{children}</dd>
  </div>
);

const ExtLink = ({ href }: { href: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-primary hover:underline">
    {href} <ExternalLink className="size-3.5 shrink-0" aria-hidden />
  </a>
);

/** Read-only view of a registration (used on the Dashboard and the success screen). */
export function RegistrationSummary({ registration: r }: { registration: Registration }) {
  return (
    <dl>
      <Row label="Project">{r.projectName}</Row>
      <Row label="Domain / Track"><Badge>{r.domain}</Badge></Row>
      <Row label="College">{r.college}</Row>
      <Row label="Course and branch">{r.course}, {r.branch} ({r.yearOfStudy})</Row>
      <Row label="Mobile">{r.mobile}</Row>
      <Row label="Team size">{r.teamSize} {r.teamSize === 1 ? '(solo)' : 'members including you'}</Row>
      {r.teamMembers.length > 0 && (
        <Row label="Team members">
          <ul className="space-y-1">
            {r.teamMembers.map((m) => <li key={m.email}>{m.name} <span className="text-muted">({m.email})</span></li>)}
          </ul>
        </Row>
      )}
      <Row label="PPT"><ExtLink href={r.pptLink} /></Row>
      <Row label="Prototype"><ExtLink href={r.prototypeLink} /></Row>
      {r.demoVideoLink && <Row label="Demo video"><ExtLink href={r.demoVideoLink} /></Row>}
    </dl>
  );
}
