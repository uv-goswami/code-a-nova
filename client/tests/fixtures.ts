import type { FormOptions, Registration, User } from '../src/types/api';

export const user: User = {
  id: 'u1', fullName: 'Aanya Sharma', email: 'aanya@example.com', role: 'participant', isVerified: true, createdAt: '2026-11-12T10:00:00.000Z',
};

export const options: FormOptions = {
  colleges: ['Delhi Technological University', 'Other'],
  courses: ['B.Tech', 'MCA'],
  branches: ['CSE', 'IT'],
  yearsOfStudy: ['1st Year', '3rd Year'],
  domains: ['AI/ML', 'Web Dev'],
  teamSize: { min: 1, max: 5 },
};

export const registration: Registration = {
  id: 'r1', user: 'u1', fullName: 'Aanya Sharma', email: 'aanya@example.com', mobile: '9876543210',
  college: 'Delhi Technological University', course: 'B.Tech', branch: 'CSE', yearOfStudy: '3rd Year', domain: 'AI/ML',
  projectName: 'Smart Attendance', pptLink: 'https://drive.google.com/file/d/abc/view', prototypeLink: 'https://github.com/team/app',
  demoVideoLink: null, teamSize: 2, teamMembers: [{ name: 'Riya Verma', email: 'riya@example.com' }], createdAt: '2026-11-13T10:00:00.000Z',
};
