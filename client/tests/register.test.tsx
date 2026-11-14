import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from '../src/api/client';
import { apiMock, registration, renderApp, resetApiMocks } from './helpers';

vi.mock('../src/api/endpoints', async () => ({ api: (await import('./apiMock')).apiMock }));

type U = ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  resetApiMocks();
  apiMock.getMyEntry.mockRejectedValue(new ApiRequestError(404, 'REGISTRATION_NOT_FOUND', 'none'));
});

async function openForm() {
  const u = userEvent.setup();
  renderApp('/register', { loggedIn: true });
  await screen.findByRole('heading', { name: /hackathon registration/i });
  return u;
}

async function fillBasics(u: U) {
  await u.type(screen.getByLabelText('Mobile number'), '9876543210');
  await u.selectOptions(screen.getByLabelText('College name'), 'Delhi Technological University');
  await u.selectOptions(screen.getByLabelText('Course'), 'B.Tech');
  await u.selectOptions(screen.getByLabelText('Branch'), 'CSE');
  await u.selectOptions(screen.getByLabelText('Year of study'), '3rd Year');
  await u.selectOptions(screen.getByLabelText('Domain / Track'), 'AI/ML');
  await u.type(screen.getByLabelText('Project name'), 'Smart Attendance');
  await u.type(screen.getByLabelText('PPT link'), 'https://drive.google.com/file/d/abc/view');
  await u.type(screen.getByLabelText('Prototype link'), 'https://github.com/team/app');
}

describe('Registration form', () => {
  it('pre-fills name and email from the account; email is read-only', async () => {
    await openForm();
    expect(screen.getByLabelText('Full name')).toHaveValue('Aanya Sharma');
    expect(screen.getByLabelText('Email address')).toHaveValue('aanya@example.com');
    expect(screen.getByLabelText('Email address')).toHaveAttribute('readonly');
  });

  it('dropdowns are filled from GET /meta/options', async () => {
    await openForm();
    const college = screen.getByLabelText('College name');
    expect(within(college).getAllByRole('option').map((o) => o.textContent)).toEqual(['Select', 'Delhi Technological University', 'Other']);
  });

  it('renders (teamSize - 1) member boxes and resizes when the size changes (ADR-0006)', async () => {
    const u = await openForm();
    expect(screen.queryByTestId('team-members')).not.toBeInTheDocument(); // default = solo
    expect(screen.getByText(/solo participation/i)).toBeInTheDocument();

    await u.selectOptions(screen.getByLabelText('Team size'), '3');
    expect(screen.getByLabelText('Member 1 name')).toBeInTheDocument();
    expect(screen.getByLabelText('Member 2 email')).toBeInTheDocument();
    expect(screen.queryByLabelText('Member 3 name')).not.toBeInTheDocument();

    await u.type(screen.getByLabelText('Member 1 name'), 'Riya Verma');
    await u.selectOptions(screen.getByLabelText('Team size'), '5');
    expect(screen.getByLabelText('Member 4 name')).toBeInTheDocument();
    expect(screen.getByLabelText('Member 1 name')).toHaveValue('Riya Verma'); // existing entries survive growing

    await u.selectOptions(screen.getByLabelText('Team size'), '1');
    expect(screen.queryByTestId('team-members')).not.toBeInTheDocument();
  });

  it('shows validation errors and does not call the API when the form is incomplete', async () => {
    const u = await openForm();
    await u.click(screen.getByRole('button', { name: /submit registration/i }));
    expect(await screen.findByText(/valid 10-digit indian mobile number/i)).toBeInTheDocument();
    expect(screen.getByText('Select your college')).toBeInTheDocument();
    expect(apiMock.registerForHackathon).not.toHaveBeenCalled();
  });

  it('submits the exact payload (no demoVideoLink when blank) and shows the success screen', async () => {
    const u = await openForm();
    await fillBasics(u);
    await u.selectOptions(screen.getByLabelText('Team size'), '2');
    await u.type(screen.getByLabelText('Member 1 name'), 'Riya Verma');
    await u.type(screen.getByLabelText('Member 1 email'), 'Riya@Example.com');
    apiMock.registerForHackathon.mockResolvedValue({ registration, emailSent: true });

    await u.click(screen.getByRole('button', { name: /submit registration/i }));

    expect(await screen.findByRole('heading', { name: /you are registered/i })).toBeInTheDocument();
    expect(apiMock.registerForHackathon).toHaveBeenCalledTimes(1);
    const body = apiMock.registerForHackathon.mock.calls[0][0];
    expect(body).toMatchObject({
      fullName: 'Aanya Sharma', email: 'aanya@example.com', mobile: '9876543210', college: 'Delhi Technological University',
      course: 'B.Tech', branch: 'CSE', yearOfStudy: '3rd Year', domain: 'AI/ML', projectName: 'Smart Attendance',
      teamSize: 2, teamMembers: [{ name: 'Riya Verma', email: 'riya@example.com' }],
    });
    expect(body.demoVideoLink).toBeUndefined();
    expect(screen.getByText(/confirmation email with your event and team details/i)).toBeInTheDocument();
  });

  it('tells the user when the registration was saved but the email failed', async () => {
    const u = await openForm();
    await fillBasics(u);
    apiMock.registerForHackathon.mockResolvedValue({ registration, emailSent: false });
    await u.click(screen.getByRole('button', { name: /submit registration/i }));
    expect(await screen.findByText(/could not be sent right now/i)).toBeInTheDocument();
  });

  it('puts server-side field errors under the matching inputs', async () => {
    const u = await openForm();
    await fillBasics(u);
    apiMock.registerForHackathon.mockRejectedValue(
      new ApiRequestError(400, 'VALIDATION_ERROR', 'Request validation failed', [{ field: 'pptLink', message: 'PPT link must be a Google Drive or OneDrive link' }]),
    );
    await u.click(screen.getByRole('button', { name: /submit registration/i }));
    expect(await screen.findByText('PPT link must be a Google Drive or OneDrive link')).toBeInTheDocument();
    expect(screen.getByLabelText('PPT link')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows a form-level error for failures that map to no field', async () => {
    const u = await openForm();
    await fillBasics(u);
    apiMock.registerForHackathon.mockRejectedValue(new ApiRequestError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check your connection and try again.'));
    await u.click(screen.getByRole('button', { name: /submit registration/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/cannot reach the server/i);
  });

  it('redirects to the dashboard if the user is already registered', async () => {
    apiMock.getMyEntry.mockReset();
    apiMock.getMyEntry.mockResolvedValue({ registration });
    renderApp('/register', { loggedIn: true });
    expect(await screen.findByRole('heading', { name: /hi, aanya/i })).toBeInTheDocument();
    // the form's page title is the only <h1> with this text (the dashboard card is an <h2>)
    expect(screen.queryByRole('heading', { level: 1, name: /hackathon registration/i })).not.toBeInTheDocument();
  });
});
