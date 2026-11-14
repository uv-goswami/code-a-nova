import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Pencil } from 'lucide-react';
import { api } from '../api/endpoints';
import { ApiRequestError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { personNameSchema } from '../lib/validation';
import type { Registration } from '../types/api';
import { RegistrationSummary } from '../components/RegistrationSummary';
import { Alert } from '../components/ui/Alert';
import { Button, LinkButton } from '../components/ui/Button';
import { Badge, Card, Spinner } from '../components/ui/Card';
import { Input } from '../components/ui/Field';

type EntryState = { status: 'loading' } | { status: 'none' } | { status: 'ready'; registration: Registration } | { status: 'error'; message: string };

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [entry, setEntry] = useState<EntryState>({ status: 'loading' });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.fullName ?? '');
  const [nameError, setNameError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadEntry = useCallback(async () => {
    setEntry({ status: 'loading' });
    try {
      const { registration } = await api.getMyEntry();
      setEntry({ status: 'ready', registration });
    } catch (err) {
      // 404 REGISTRATION_NOT_FOUND is the normal "not registered yet" state, not an error.
      if (err instanceof ApiRequestError && err.code === 'REGISTRATION_NOT_FOUND') setEntry({ status: 'none' });
      else setEntry({ status: 'error', message: err instanceof ApiRequestError ? err.message : 'Could not load your registration.' });
    }
  }, []);

  useEffect(() => { void loadEntry(); }, [loadEntry]);

  const saveName = async () => {
    const parsed = personNameSchema.safeParse(name.trim());
    if (!parsed.success) return setNameError(parsed.error.issues[0].message);
    setNameError('');
    try {
      const { user: updated } = await api.updateMe(name.trim());
      setUser(updated);
      setEditing(false);
    } catch (err) {
      setNameError(err instanceof ApiRequestError ? err.message : 'Could not update your name.');
    }
  };

  const withdraw = async () => {
    if (entry.status !== 'ready') return;
    setActionError('');
    try {
      await api.deleteRegistration(entry.registration.id);
      setConfirmingDelete(false);
      setEntry({ status: 'none' });
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : 'Could not withdraw your registration.');
    }
  };

  if (!user) return null;

  return (
    <section className="bg-surface py-8 sm:py-12">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <header>
          <h1 className="text-2xl font-bold sm:text-3xl">Hi, {user.fullName.split(' ')[0]}</h1>
          <p className="mt-1 text-muted">Manage your profile and hackathon registration here.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="h-fit p-6 lg:col-span-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold">Profile</h2>
              <Badge tone="green"><CheckCircle2 className="mr-1 size-3.5" aria-hidden /> Verified</Badge>
            </div>
            {editing ? (
              <div className="mt-4 space-y-3">
                <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={nameError} />
                <div className="flex gap-2">
                  <Button onClick={saveName}>Save</Button>
                  <Button variant="ghost" onClick={() => { setEditing(false); setName(user.fullName); setNameError(''); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="text-muted">Name</dt><dd className="font-medium">{user.fullName}</dd></div>
                <div><dt className="text-muted">Email</dt><dd className="break-all font-medium">{user.email}</dd></div>
                <div><dt className="text-muted">Member since</dt><dd className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</dd></div>
                <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="size-4" aria-hidden /> Edit name</Button>
              </dl>
            )}
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold">Hackathon registration</h2>

            {entry.status === 'loading' && <Spinner label="Loading your registration" />}

            {entry.status === 'error' && (
              <div className="mt-4 space-y-3">
                <Alert kind="error">{entry.message}</Alert>
                <Button variant="outline" onClick={loadEntry}>Try again</Button>
              </div>
            )}

            {entry.status === 'none' && (
              <div className="mt-4 rounded-lg border border-dashed border-primary/40 bg-primary-50 p-8 text-center">
                <p className="text-lg font-semibold text-primary">You have not registered yet</p>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted">Register your project and team to take part in the Code-a-Nova Hackathon. It takes about 5 minutes.</p>
                <LinkButton to="/register" size="lg" className="mt-5">Register Now <ArrowRight className="size-4" aria-hidden /></LinkButton>
              </div>
            )}

            {entry.status === 'ready' && (
              <div className="mt-2">
                <div className="mb-2 flex items-center gap-2"><Badge tone="green">Registered</Badge><span className="text-sm text-muted">A confirmation was emailed to you.</span></div>
                <RegistrationSummary registration={entry.registration} />
                {actionError && <div className="mt-4"><Alert kind="error">{actionError}</Alert></div>}
                <div className="mt-6 border-t border-line pt-4">
                  {confirmingDelete ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium">Withdraw your registration? This cannot be undone.</span>
                      <Button variant="danger" onClick={withdraw}>Yes, withdraw</Button>
                      <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>Keep it</Button>
                    </div>
                  ) : (
                    <Button variant="danger" onClick={() => setConfirmingDelete(true)}>Withdraw registration</Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
