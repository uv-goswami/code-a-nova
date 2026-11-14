import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../api/endpoints';
import { ApiRequestError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { loginSchema, type LoginForm } from '../lib/validation';
import { AuthShell } from '../components/AuthShell';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Field';

interface LocationState { verified?: boolean; email?: string; from?: string }

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const state = (useLocation().state ?? {}) as LocationState;
  const [formError, setFormError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: state.email ?? '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(''); setNeedsVerification(false);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate(state.from ?? '/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'EMAIL_NOT_VERIFIED') setNeedsVerification(true);
      setFormError(err instanceof ApiRequestError ? err.message : 'Login failed. Please try again.');
    }
  });

  // Unverified account: send a fresh OTP and continue on the OTP page.
  const verifyNow = async () => {
    const email = getValues('email').trim().toLowerCase();
    try { await api.resendOtp(email); } catch { /* cooldown: the previous code may still be valid */ }
    sessionStorage.setItem('pendingEmail', email);
    navigate('/verify-otp', { state: { email } });
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage your hackathon registration.">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {state.verified && <Alert kind="success">Email verified. You can log in now.</Alert>}
        {formError && (
          <Alert kind="error">
            {formError}{' '}
            {needsVerification && <button type="button" onClick={verifyNow} className="font-semibold underline">Verify now</button>}
          </Alert>
        )}
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Login</Button>
        <p className="text-center text-sm text-muted">New here? <Link to="/signup" className="font-semibold text-primary hover:underline">Create an account</Link></p>
      </form>
    </AuthShell>
  );
}
