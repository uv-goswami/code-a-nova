// All editable marketing copy lives here. EDIT THESE VALUES before going live:
// dates, prizes and social links below are PLACEHOLDERS.
export const event = {
  name: 'Code-a-Nova Hackathon',
  year: '2026',
  tagline: 'Build. Compete. Launch your idea.',
  description:
    'A hackathon for students to turn ideas into working prototypes across AI, web, IoT, security and more, with mentors, prizes and a shot at the finale.',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'hello@code-a-nova.example',
  stats: [
    { label: 'Tracks', value: '6+' },
    { label: 'Team size', value: '1 to 5' },
    { label: 'Prize pool', value: 'Rs 1,00,000' },
    { label: 'Mode', value: 'Hybrid' },
  ],
  highlights: [
    { title: 'Real problem statements', text: 'Pick a track and solve problems that matter, from AI/ML to cyber security.' },
    { title: 'Mentor support', text: 'Industry mentors review your idea and prototype before the final round.' },
    { title: 'Team up or go solo', text: 'Register alone or with up to four teammates. You choose.' },
    { title: 'Certificates and perks', text: 'Every participant who submits gets a certificate. Finalists get more.' },
  ],
  timeline: [
    { date: '20 Nov 2026', title: 'Registrations open', text: 'Create an account, verify your email and register your team.' },
    { date: '05 Dec 2026', title: 'Idea and PPT submission', text: 'Share your presentation and prototype links.' },
    { date: '12 Dec 2026', title: 'Shortlisting', text: 'Top teams are announced and invited to the final round.' },
    { date: '20 Dec 2026', title: 'Grand finale', text: 'Demo to the jury, get feedback, and find out who wins.' },
  ],
  prizes: [
    { place: '1st Prize', amount: 'Rs 50,000', note: 'Trophy, certificates and goodies' },
    { place: '2nd Prize', amount: 'Rs 30,000', note: 'Trophy and certificates' },
    { place: '3rd Prize', amount: 'Rs 20,000', note: 'Trophy and certificates' },
  ],
  tracks: ['AI/ML', 'Web Dev', 'IoT', 'Cyber Security', 'Blockchain', 'Mobile Apps', 'Cloud/DevOps'],
  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'X', href: 'https://x.com/' },
  ],
};
