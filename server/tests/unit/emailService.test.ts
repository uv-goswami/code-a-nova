// Verifies the graded email rules without sending anything: sender name, escaping, content.
// mock-prefixed variable names are allowed inside jest.mock factories.
const mockSendMail = jest.fn().mockResolvedValue({});
jest.mock('nodemailer', () => ({ createTransport: jest.fn(() => ({ sendMail: mockSendMail })) }));

import * as emailService from '../../src/services/emailService';

beforeEach(() => mockSendMail.mockClear());

describe('emailService', () => {
  test('OTP email: sender name is Code-a-Nova, contains OTP and 10-minute expiry', async () => {
    await emailService.sendOtpEmail('user@example.com', '482913');
    const mail = mockSendMail.mock.calls[0][0];
    expect(mail.from).toEqual({ name: 'Code-a-Nova', address: 'project@example.com' });
    expect(mail.to).toBe('user@example.com');
    expect(mail.html).toContain('482913');
    expect(mail.html).toContain('10 minutes');
  });

  test('confirmation email: has participant, event, domain, project and team details; sender is Code-a-Nova', async () => {
    await emailService.sendRegistrationConfirmation('aanya@example.com', {
      fullName: 'Aanya Sharma', projectName: 'Smart Attendance', domain: 'AI/ML',
      college: 'Delhi Technological University', teamSize: 2,
      teamMembers: [{ name: 'Riya Verma', email: 'riya@example.com' }],
    });
    const mail = mockSendMail.mock.calls[0][0];
    expect(mail.from.name).toBe('Code-a-Nova');
    ['Aanya Sharma', 'Smart Attendance', 'AI/ML', 'Riya Verma', 'riya@example.com', 'Code-a-Nova Hackathon']
      .forEach((text) => expect(mail.html).toContain(text));
  });

  test('user-supplied values are HTML-escaped (no injection)', async () => {
    await emailService.sendRegistrationConfirmation('a@example.com', {
      fullName: '<script>alert(1)</script>', projectName: '<img src=x onerror=1>', domain: 'AI/ML',
      college: 'Other', teamSize: 1, teamMembers: [],
    });
    const { html } = mockSendMail.mock.calls[0][0];
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;script&gt;');
  });

  test('contact notification goes to the project inbox with replyTo = visitor', async () => {
    await emailService.sendContactNotification({ name: 'Dev', email: 'dev@example.com', message: 'Hello <b>team</b>' });
    const mail = mockSendMail.mock.calls[0][0];
    expect(mail.to).toBe('project@example.com');
    expect(mail.replyTo).toBe('dev@example.com');
    expect(mail.html).not.toContain('<b>team</b>');
  });
});
