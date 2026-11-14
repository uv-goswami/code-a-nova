import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../api/endpoints';
import { ApiRequestError } from '../api/client';
import { signupSchema, type SignupForm } from '../lib/validation';
import { applyApiError } from '../lib/formErrors';
import { AuthShell } from '../components/AuthShell';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Field';

const FIELDS = ['fullName', 'email', 'password', 'confirmPassword'];

export default function Signup() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError('');
    try {
      const email = values.email.trim().toLowerCase();
      await api.signup({ ...values, fullName: values.fullName.trim(), email });
      sessionStorage.setItem('pendingEmail', email);
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      // The account WAS created but the OTP email failed: continue to the OTP page, where "Resend" can recover.
      if (err instanceof ApiRequestError && err.code === 'EMAIL_SEND_FAILED') {
        const email = values.email.trim().toLowerCase();
        sessionStorage.setItem('pendingEmail', email);
        navigate('/verify-otp', { state: { email, notSent: true } });
        return;
      }
      setFormError(applyApiError(err, setError, FIELDS));
    }
  });

  return (
    <AuthShell title="Create your account" subtitle="We will email you a 6-digit code to verify it.">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && <Alert kind="error">{formError}</Alert>}
        <Input label="Full name" autoComplete="name" placeholder="Aanya Sharma" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" autoComplete="new-password" hint="8+ characters with a letter and a number" error={errors.password?.message} {...register('password')} />
        <Input label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Sign up</Button>
        <p className="text-center text-sm text-muted">Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Login</Link></p>
      </form>
    </AuthShell>
  );
}
