import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/endpoints';
import { ApiRequestError } from '../api/client';
import { otpSchema } from '../lib/validation';
import { AuthShell } from '../components/AuthShell';
import { OtpInput } from '../components/OtpInput';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Field';

const RESEND_SECONDS = 60; // matches the server's default OTP_RESEND_COOLDOWN_SECONDS

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as { email?: string; notSent?: boolean } | null;
  const initialEmail = routeState?.email ?? sessionStorage.getItem('pendingEmail') ?? '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(routeState?.notSent ? 'We could not send the verification email. Wait a moment, then press Resend code.' : '');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(initialEmail ? RESEND_SECONDS : 0);

  // Resend countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!email.trim()) return setError('Enter the email you signed up with.');
    if (!otpSchema.safeParse(otp).success) return setError('Enter the 6-digit code from your email.');
    setBusy(true);
    try {
      await api.verifyOtp({ email: email.trim().toLowerCase(), otp });
      sessionStorage.removeItem('pendingEmail');
      navigate('/login', { replace: true, state: { verified: true, email: email.trim().toLowerCase() } });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Verification failed. Please try again.');
      if (err instanceof ApiRequestError && err.code !== 'INVALID_OTP') setOtp('');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError(''); setInfo('');
    if (!email.trim()) return setError('Enter your email first.');
    try {
      await api.resendOtp(email.trim().toLowerCase());
      setOtp('');
      setInfo('A new code has been sent. The previous code no longer works.');
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not resend the code.');
    }
  };

  return (
    <AuthShell title="Verify your email" subtitle={email ? `Enter the 6-digit code sent to ${email}. It expires in 10 minutes.` : 'Enter your email and the 6-digit code we sent you.'}>
      <form onSubmit={verify} noValidate className="space-y-5">
        {error && <Alert kind="error">{error}</Alert>}
        {info && <Alert kind="success">{info}</Alert>}
        {!initialEmail && <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />}
        <OtpInput value={otp} onChange={setOtp} disabled={busy} hasError={!!error} />
        <Button type="submit" size="lg" className="w-full" loading={busy} disabled={otp.length !== 6}>Verify</Button>
        <div className="flex items-center justify-between text-sm">
          <Button type="button" variant="ghost" onClick={resend} disabled={secondsLeft > 0}>
            {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : 'Resend code'}
          </Button>
          <Link to="/signup" className="text-muted hover:underline">Wrong email?</Link>
        </div>
      </form>
    </AuthShell>
  );
}
