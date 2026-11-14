import { ArrowRight, Award, CalendarDays, Lightbulb, Trophy, Users } from 'lucide-react';
import { event } from '../content/event';
import { useAuth } from '../context/AuthContext';
import { LinkButton } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const icons = [Lightbulb, Users, Users, Award];

const SectionHead = ({ id, eyebrow, title, text }: { id: string; eyebrow: string; title: string; text?: string }) => (
  <div className="mx-auto mb-10 max-w-2xl text-center">
    <p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
    <h2 id={id} className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h2>
    {text && <p className="mt-3 text-muted">{text}</p>}
  </div>
);

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      {/* Hero: flat colour block, no gradients */}
      <section className="bg-primary-50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">Registrations open</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {event.name} <span className="text-primary">{event.year}</span>
            </h1>
            <p className="mt-2 text-xl font-semibold text-primary">{event.tagline}</p>
            <p className="mt-4 max-w-lg text-muted">{event.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <LinkButton to="/dashboard" size="lg">Go to dashboard <ArrowRight className="size-4" aria-hidden /></LinkButton>
              ) : (
                <>
                  <LinkButton to="/signup" size="lg">Register Now <ArrowRight className="size-4" aria-hidden /></LinkButton>
                  <LinkButton to="/login" variant="outline" size="lg">Login</LinkButton>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4" aria-label="Event at a glance">
            {event.stats.map((s, i) => (
              <Card key={s.label} className={`p-6 ${i === 2 ? 'border-accent bg-accent-50' : ''}`}>
                <p className="whitespace-nowrap text-xl font-extrabold text-primary sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="highlights">
        <SectionHead id="highlights" eyebrow="Why join" title="Event highlights" text="Everything you need to go from idea to prototype." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {event.highlights.map((h, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Card key={h.title} className="p-6">
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary-50 text-primary"><Icon className="size-5" aria-hidden /></span>
                <h3 className="mt-4 font-semibold">{h.title}</h3>
                <p className="mt-1 text-sm text-muted">{h.text}</p>
              </Card>
            );
          })}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Tracks">
          {event.tracks.map((t) => <span key={t} className="rounded-full border border-line bg-white px-4 py-1.5 text-sm font-medium text-ink">{t}</span>)}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-surface py-16" aria-labelledby="timeline-title">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHead id="timeline-title" eyebrow="Roadmap" title="Timeline" />
          <ol className="relative space-y-6 border-l-2 border-primary-100 pl-8">
            {event.timeline.map((step) => (
              <li key={step.title} className="relative">
                <span className="absolute -left-[41px] top-1 flex size-5 items-center justify-center rounded-full border-4 border-white bg-primary" aria-hidden />
                <Card className="p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold text-primary"><CalendarDays className="size-4" aria-hidden /> {step.date}</p>
                  <h3 className="mt-1 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted">{step.text}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Prizes */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="prizes-title">
        <SectionHead id="prizes-title" eyebrow="Rewards" title="Prizes" text="Top teams take home cash prizes, trophies and certificates." />
        <div className="grid gap-5 md:grid-cols-3">
          {event.prizes.map((p, i) => (
            <Card key={p.place} className={`p-8 text-center ${i === 0 ? 'border-accent bg-accent-50' : ''}`}>
              <Trophy className={`mx-auto size-10 ${i === 0 ? 'text-[#b88700]' : 'text-primary'}`} aria-hidden />
              <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted">{p.place}</p>
              <p className="mt-1 text-3xl font-extrabold text-primary">{p.amount}</p>
              <p className="mt-2 text-sm text-muted">{p.note}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-primary">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-14 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to build something great?</h2>
          <p className="max-w-xl text-white/80">Create your account, verify your email and register your team in minutes.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton to={user ? '/dashboard' : '/signup'} variant="accent" size="lg">{user ? 'Go to dashboard' : 'Register Now'}</LinkButton>
            {!user && <LinkButton to="/login" variant="outline" size="lg">Login</LinkButton>}
          </div>
        </div>
      </section>
    </>
  );
}
