import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from '../src/api/client';
import { apiMock, registration, renderApp, resetApiMocks, user } from './helpers';

vi.mock('../src/api/endpoints', async () => ({ api: (await import('./apiMock')).apiMock }));

const notRegistered = () => new ApiRequestError(404, 'REGISTRATION_NOT_FOUND', 'You have not registered yet');

beforeEach(() => resetApiMocks());

describe('public pages and navbar', () => {
  it('Home shows the hero with Register Now and Login CTAs', async () => {
    renderApp('/');
    expect(screen.getByRole('heading', { level: 1, name: /code-a-nova hackathon/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /register now/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Login' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Timeline' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Prizes' })).toBeInTheDocument();
  });

  it('hamburger menu toggles the mobile navigation', async () => {
    const u = userEvent.setup();
    renderApp('/');
    expect(screen.queryByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: /open menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await u.click(toggle);
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('mobile-menu')).toBeInTheDocument();
  });

  it('footer shows quick links and the contact email', () => {
    renderApp('/');
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: /@/ })).toHaveAttribute('href', expect.stringContaining('mailto:'));
  });

  it('Contact form validates, then submits', async () => {
    const u = userEvent.setup();
    apiMock.submitContact.mockResolvedValue({ message: 'ok', contactEmail: 'x@y.z' });
    renderApp('/contact');
    await u.click(await screen.findByRole('button', { name: /send message/i }));
    expect(await screen.findByText(/write at least 10 characters/i)).toBeInTheDocument();
    expect(apiMock.submitContact).not.toHaveBeenCalled();

    await u.type(screen.getByLabelText('Name'), 'Dev Patel');
    await u.type(screen.getByLabelText('Email'), 'dev@example.com');
    await u.type(screen.getByLabelText('Message'), 'Is there a limit on teams per college?');
    await u.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText(/we have received your message/i)).toBeInTheDocument();
    expect(apiMock.submitContact).toHaveBeenCalledWith({ name: 'Dev Patel', email: 'dev@example.com', message: 'Is there a limit on teams per college?' });
  });

  it('unknown route shows 404', async () => {
    renderApp('/nope');
    expect(await screen.findByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });
});

describe('signup and OTP', () => {
  it('blocks submit when passwords differ (no API call)', async () => {
    const u = userEvent.setup();
    renderApp('/signup');
    await u.type(await screen.findByLabelText('Full name'), 'Aanya Sharma');
    await u.type(screen.getByLabelText('Email'), 'aanya@example.com');
    await u.type(screen.getByLabelText('Password'), 'Passw0rdOK');
    await u.type(screen.getByLabelText('Confirm password'), 'Different1');
    await u.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(apiMock.signup).not.toHaveBeenCalled();
  });

  it('signup success goes to OTP verification, verify success goes to login', async () => {
    const u = userEvent.setup();
    apiMock.signup.mockResolvedValue({ email: 'aanya@example.com', message: 'sent' });
    apiMock.verifyOtp.mockResolvedValue({ message: 'verified' });
    renderApp('/signup');

    await u.type(await screen.findByLabelText('Full name'), 'Aanya Sharma');
    await u.type(screen.getByLabelText('Email'), 'Aanya@Example.com');
    await u.type(screen.getByLabelText('Password'), 'Passw0rdOK');
    await u.type(screen.getByLabelText('Confirm password'), 'Passw0rdOK');
    await u.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(await screen.findByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
    expect(apiMock.signup).toHaveBeenCalledWith(expect.objectContaining({ email: 'aanya@example.com', fullName: 'Aanya Sharma' }));
    expect(screen.getByText(/aanya@example.com/)).toBeInTheDocument();

    const verify = screen.getByRole('button', { name: 'Verify' });
    expect(verify).toBeDisabled();
    await u.click(screen.getByLabelText('Digit 1'));
    await u.paste('482913');
    await u.click(verify);

    expect(apiMock.verifyOtp).toHaveBeenCalledWith({ email: 'aanya@example.com', otp: '482913' });
    expect(await screen.findByText(/email verified\. you can log in now/i)).toBeInTheDocument();
  });

  it('shows the server error for a wrong OTP and a disabled resend during cooldown', async () => {
    const u = userEvent.setup();
    apiMock.verifyOtp.mockRejectedValue(new ApiRequestError(400, 'INVALID_OTP', 'Invalid or expired OTP'));
    renderApp('/verify-otp');
    // no email in state: the page asks for it
    await u.type(await screen.findByLabelText('Email'), 'a@example.com');
    await u.click(screen.getByLabelText('Digit 1'));
    await u.paste('111111');
    await u.click(screen.getByRole('button', { name: 'Verify' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid or expired OTP');
  });

  it('if the OTP email could not be sent, continues to the OTP page with a Resend hint', async () => {
    const u = userEvent.setup();
    apiMock.signup.mockRejectedValue(new ApiRequestError(502, 'EMAIL_SEND_FAILED', 'Could not send the OTP email. Please try resending.'));
    renderApp('/signup');
    await u.type(await screen.findByLabelText('Full name'), 'Aanya Sharma');
    await u.type(screen.getByLabelText('Email'), 'aanya@example.com');
    await u.type(screen.getByLabelText('Password'), 'Passw0rdOK');
    await u.type(screen.getByLabelText('Confirm password'), 'Passw0rdOK');
    await u.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(await screen.findByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/could not send the verification email/i);
  });

  it('shows the field error when the email is already registered', async () => {
    const u = userEvent.setup();
    apiMock.signup.mockRejectedValue(new ApiRequestError(409, 'EMAIL_ALREADY_REGISTERED', 'An account with this email already exists'));
    renderApp('/signup');
    await u.type(await screen.findByLabelText('Full name'), 'Aanya Sharma');
    await u.type(screen.getByLabelText('Email'), 'aanya@example.com');
    await u.type(screen.getByLabelText('Password'), 'Passw0rdOK');
    await u.type(screen.getByLabelText('Confirm password'), 'Passw0rdOK');
    await u.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(await screen.findByText('An account with this email already exists')).toBeInTheDocument();
  });
});

describe('login, guards and dashboard', () => {
  it('redirects a logged-out visitor from /dashboard to login', async () => {
    renderApp('/dashboard');
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('login success lands on the dashboard with a Register Now CTA when not registered', async () => {
    const u = userEvent.setup();
    apiMock.login.mockResolvedValue({ token: 'jwt', user });
    apiMock.getMe.mockResolvedValue({ user });
    apiMock.getMyEntry.mockRejectedValue(notRegistered());
    renderApp('/login');
    await u.type(await screen.findByLabelText('Email'), 'aanya@example.com');
    await u.type(screen.getByLabelText('Password'), 'Passw0rdOK');
    await u.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByRole('heading', { name: /hi, aanya/i })).toBeInTheDocument();
    expect(localStorage.getItem('can_token')).toBe('jwt');
    expect(await screen.findByRole('link', { name: /register now/i })).toHaveAttribute('href', '/register');
  });

  it('wrong credentials show the server message and keep the user logged out', async () => {
    const u = userEvent.setup();
    apiMock.login.mockRejectedValue(new ApiRequestError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'));
    renderApp('/login');
    await u.type(await screen.findByLabelText('Email'), 'aanya@example.com');
    await u.type(screen.getByLabelText('Password'), 'WrongPass1');
    await u.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
    expect(localStorage.getItem('can_token')).toBeNull();
  });

  it('unverified account offers "Verify now", which resends an OTP and opens the OTP page', async () => {
    const u = userEvent.setup();
    apiMock.login.mockRejectedValue(new ApiRequestError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email before logging in'));
    apiMock.resendOtp.mockResolvedValue({ message: 'sent' });
    renderApp('/login');
    await u.type(await screen.findByLabelText('Email'), 'aanya@example.com');
    await u.type(screen.getByLabelText('Password'), 'Passw0rdOK');
    await u.click(screen.getByRole('button', { name: 'Login' }));
    await u.click(await screen.findByRole('button', { name: /verify now/i }));
    expect(apiMock.resendOtp).toHaveBeenCalledWith('aanya@example.com');
    expect(await screen.findByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
  });

  it('dashboard shows registration details and the withdraw flow works', async () => {
    const u = userEvent.setup();
    apiMock.getMyEntry.mockResolvedValue({ registration });
    apiMock.deleteRegistration.mockResolvedValue({ message: 'deleted' });
    renderApp('/dashboard', { loggedIn: true });

    expect(await screen.findByText('Smart Attendance')).toBeInTheDocument();
    expect(screen.getByText('Riya Verma')).toBeInTheDocument();

    await u.click(screen.getByRole('button', { name: /withdraw registration/i }));
    await u.click(screen.getByRole('button', { name: /yes, withdraw/i }));
    expect(apiMock.deleteRegistration).toHaveBeenCalledWith('r1');
    expect(await screen.findByText(/you have not registered yet/i)).toBeInTheDocument();
  });

  it('profile name can be edited', async () => {
    const u = userEvent.setup();
    apiMock.getMyEntry.mockRejectedValue(notRegistered());
    apiMock.updateMe.mockResolvedValue({ user: { ...user, fullName: 'Aanya Kapoor' } });
    renderApp('/dashboard', { loggedIn: true });
    await u.click(await screen.findByRole('button', { name: /edit name/i }));
    const input = screen.getByLabelText('Full name');
    await u.clear(input);
    await u.type(input, 'Aanya Kapoor');
    await u.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Aanya Kapoor')).toBeInTheDocument();
    expect(apiMock.updateMe).toHaveBeenCalledWith('Aanya Kapoor');
  });

  it('logout clears the token and returns to Home', async () => {
    const u = userEvent.setup();
    apiMock.getMyEntry.mockRejectedValue(notRegistered());
    renderApp('/dashboard', { loggedIn: true });
    await screen.findByRole('heading', { name: /hi, aanya/i });
    const nav = screen.getByRole('navigation', { name: 'Main' });
    await u.click(within(nav).getAllByRole('button', { name: 'Logout' })[0]);
    expect(localStorage.getItem('can_token')).toBeNull();
    expect(await screen.findByRole('heading', { level: 1, name: /code-a-nova hackathon/i })).toBeInTheDocument();
  });

  it('an invalid stored token is discarded and the user is sent to login', async () => {
    localStorage.setItem('can_token', 'expired');
    apiMock.getMe.mockRejectedValue(new ApiRequestError(401, 'TOKEN_EXPIRED', 'Session expired'));
    renderApp('/dashboard');
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem('can_token')).toBeNull());
  });
});
