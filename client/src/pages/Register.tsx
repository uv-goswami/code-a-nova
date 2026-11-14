import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../api/endpoints';
import { ApiRequestError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOptions } from '../hooks/useOptions';
import { memberBoxCount, registrationSchema, TEAM_MAX, TEAM_MIN, type RegistrationForm } from '../lib/validation';
import { applyApiError } from '../lib/formErrors';
import type { Registration, RegistrationRequest } from '../types/api';
import { RegistrationSummary } from '../components/RegistrationSummary';
import { Alert } from '../components/ui/Alert';
import { Button, LinkButton } from '../components/ui/Button';
import { Card, Spinner } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Field';

const FIELDS = ['fullName', 'email', 'mobile', 'college', 'course', 'branch', 'yearOfStudy', 'domain', 'projectName', 'pptLink', 'prototypeLink', 'demoVideoLink', 'teamSize'];
const teamSizes = Array.from({ length: TEAM_MAX - TEAM_MIN + 1 }, (_, i) => String(TEAM_MIN + i));

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <fieldset className="space-y-4">
    <legend className="mb-1 border-b border-line pb-2 text-base font-semibold text-primary w-full">{title}</legend>
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  </fieldset>
);

export default function Register() {
  const { user } = useAuth();
  const { options, error: optionsError } = useOptions();
  const [checking, setChecking] = useState(true);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState<{ registration: Registration; emailSent: boolean }>();

  const { register, handleSubmit, watch, setValue, setError, formState: { errors, isSubmitting } } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: user?.fullName ?? '', email: user?.email ?? '', mobile: '', college: '', course: '', branch: '', yearOfStudy: '',
      domain: '', projectName: '', pptLink: '', prototypeLink: '', demoVideoLink: '', teamSize: 1, teamMembers: [],
    },
  });

  // One registration per user: if they already have one, send them to the dashboard.
  useEffect(() => {
    api.getMyEntry()
      .then(() => setAlreadyRegistered(true))
      .catch(() => { /* 404 = not registered yet, which is what we want */ })
      .finally(() => setChecking(false));
  }, []);

  // Dynamic team member boxes: (teamSize - 1) pairs, resized whenever the team size changes (ADR-0006).
  const teamSize = watch('teamSize');
  const boxCount = Number.isFinite(teamSize) ? memberBoxCount(teamSize) : 0;
  useEffect(() => {
    const current = (watch('teamMembers') ?? []) as { name: string; email: string }[];
    if (current.length !== boxCount) {
      setValue('teamMembers', Array.from({ length: boxCount }, (_, i) => current[i] ?? { name: '', email: '' }));
    }
  }, [boxCount, setValue, watch]);

  const onSubmit = handleSubmit(async (v) => {
    setFormError('');
    const body = {
      ...v,
      fullName: v.fullName.trim(),
      email: v.email.trim().toLowerCase(),
      projectName: v.projectName.trim(),
      pptLink: v.pptLink.trim(),
      prototypeLink: v.prototypeLink.trim(),
      demoVideoLink: v.demoVideoLink.trim() || undefined, // optional: omit when empty
      teamMembers: v.teamMembers.map((m) => ({ name: m.name.trim(), email: m.email.trim().toLowerCase() })),
    } as RegistrationRequest;

    try {
      setDone(await api.registerForHackathon(body));
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'ALREADY_REGISTERED') return setAlreadyRegistered(true);
      setFormError(applyApiError(err, setError, FIELDS));
    }
  });

  if (checking || (!options && !optionsError)) return <Spinner label="Preparing the form" />;
  if (alreadyRegistered && !done) return <Navigate to="/dashboard" replace />;

  // ---------- success screen ----------
  if (done) {
    return (
      <section className="bg-surface py-10 sm:py-16">
        <Card className="mx-auto max-w-2xl p-6 sm:p-10">
          <div className="text-center">
            <CheckCircle2 className="mx-auto size-14 text-success" aria-hidden />
            <h1 className="mt-4 text-2xl font-bold">You are registered!</h1>
            <p className="mt-1 text-muted">Welcome to the Code-a-Nova Hackathon.</p>
          </div>
          <div className="mt-5">
            {done.emailSent
              ? <Alert kind="success">A confirmation email with your event and team details is on its way to {done.registration.email}.</Alert>
              : <Alert kind="info">Your registration is saved, but the confirmation email could not be sent right now. You can see everything on your dashboard.</Alert>}
          </div>
          <div className="mt-6"><RegistrationSummary registration={done.registration} /></div>
          <div className="mt-6 text-center"><LinkButton to="/dashboard" size="lg">Go to dashboard</LinkButton></div>
        </Card>
      </section>
    );
  }

  if (!options) return <div className="mx-auto max-w-xl p-8"><Alert kind="error">{optionsError ?? 'Could not load form options.'}</Alert></div>;

  return (
    <section className="bg-surface py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Hackathon registration</h1>
        <p className="mt-1 text-muted">All fields are required unless marked optional.</p>

        <Card className="mt-6 p-5 sm:p-8">
          <form onSubmit={onSubmit} noValidate className="space-y-8">
            {formError && <Alert kind="error">{formError}</Alert>}

            <Section title="Participant details">
              <Input label="Full name" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
              <Input label="Email address" type="email" readOnly hint="Taken from your account" error={errors.email?.message} {...register('email')} />
              <Input label="Mobile number" type="tel" inputMode="numeric" maxLength={10} placeholder="9876543210" error={errors.mobile?.message} {...register('mobile')} />
              <Select label="College name" options={options.colleges} error={errors.college?.message} {...register('college')} />
            </Section>

            <Section title="Academic details">
              <Select label="Course" options={options.courses} error={errors.course?.message} {...register('course')} />
              <Select label="Branch" options={options.branches} error={errors.branch?.message} {...register('branch')} />
              <Select label="Year of study" options={options.yearsOfStudy} error={errors.yearOfStudy?.message} {...register('yearOfStudy')} />
              <Select label="Domain / Track" options={options.domains} error={errors.domain?.message} {...register('domain')} />
            </Section>

            <Section title="Project details">
              <div className="sm:col-span-2"><Input label="Project name" error={errors.projectName?.message} {...register('projectName')} /></div>
              <div className="sm:col-span-2"><Input label="PPT link" type="url" placeholder="https://drive.google.com/..." hint="Google Drive or OneDrive shareable link" error={errors.pptLink?.message} {...register('pptLink')} /></div>
              <div className="sm:col-span-2"><Input label="Prototype link" type="url" placeholder="https://github.com/..." hint="GitHub, Figma or live demo link" error={errors.prototypeLink?.message} {...register('prototypeLink')} /></div>
              <div className="sm:col-span-2"><Input label="Demo video link" type="url" optional placeholder="https://youtu.be/..." hint="YouTube or Drive link" error={errors.demoVideoLink?.message} {...register('demoVideoLink')} /></div>
            </Section>

            <fieldset className="space-y-4">
              <legend className="mb-1 w-full border-b border-line pb-2 text-base font-semibold text-primary">Team</legend>
              <div className="max-w-xs">
                <Select
                  label="Team size"
                  placeholder="Select team size"
                  options={teamSizes}
                  hint="Includes you. Choose 1 to go solo."
                  error={errors.teamSize?.message}
                  {...register('teamSize', { valueAsNumber: true })}
                />
              </div>

              {boxCount === 0 ? (
                <p className="text-sm text-muted">Solo participation: no teammates to add.</p>
              ) : (
                <div className="space-y-4" data-testid="team-members">
                  <p className="text-sm text-muted">Add the {boxCount} other member{boxCount > 1 ? 's' : ''} of your team.</p>
                  {Array.from({ length: boxCount }, (_, i) => (
                    <div key={i} className="grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2">
                      <Input label={`Member ${i + 1} name`} error={errors.teamMembers?.[i]?.name?.message} {...register(`teamMembers.${i}.name` as const)} />
                      <Input label={`Member ${i + 1} email`} type="email" error={errors.teamMembers?.[i]?.email?.message} {...register(`teamMembers.${i}.email` as const)} />
                    </div>
                  ))}
                </div>
              )}
            </fieldset>

            <Button type="submit" size="lg" className="w-full sm:w-auto" loading={isSubmitting}>Submit registration</Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
