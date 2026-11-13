import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { event } from '../content/event';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <Logo light />
          <p className="max-w-xs text-sm text-white/80">{event.tagline}</p>
          <a href={`mailto:${event.contactEmail}`} className="inline-flex items-center gap-2 text-sm text-white/90 hover:underline">
            <Mail className="size-4" aria-hidden /> {event.contactEmail}
          </a>
        </div>

        <nav aria-label="Quick links">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">Quick links</h2>
          <ul className="space-y-2 text-sm text-white/90">
            {[['/', 'Home'], ['/about', 'About'], ['/contact', 'Contact'], ['/login', 'Login'], ['/signup', 'Sign up']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:underline">{label}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Social links">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">Follow us</h2>
          <ul className="space-y-2 text-sm text-white/90">
            {event.social.map((s) => (
              <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.label}</a></li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-xs text-white/70">
        &copy; {new Date().getFullYear()} Code-a-Nova. All rights reserved.
      </div>
    </footer>
  );
}
