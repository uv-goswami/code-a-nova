import { event } from '../content/event';
import { LinkButton } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const steps = [
  ['Sign up', 'Create an account with your name, email and a password.'],
  ['Verify email', 'Enter the 6-digit code we email you. It expires in 10 minutes.'],
  ['Register', 'Fill in your college, project and team details.'],
  ['Get confirmation', 'We email you a confirmation with your team details.'],
];
const faqs = [
  ['Who can participate?', 'Students from any college can take part, solo or in teams of up to 5 (including you).'],
  ['Can I change my registration later?', 'You can withdraw it from your dashboard and register again with updated details.'],
  ['Do I need a finished product?', 'No. A working prototype plus a presentation is enough for the first round.'],
  ['I did not receive the OTP email', 'Check your spam folder, then use "Resend code" on the verification page.'],
];

export default function About() {
  return (
    <>
      <section className="bg-primary-50 py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-extrabold sm:text-4xl">About Code-a-Nova</h1>
          <p className="mt-4 text-muted">{event.description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <h2 className="mb-8 text-center text-2xl font-bold">How it works</h2>
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, text], i) => (
            <Card key={title} className="p-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{i + 1}</span>
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </Card>
          ))}
        </ol>
      </section>

      <section className="bg-surface py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-6 text-center text-2xl font-bold">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map(([q, a]) => (
              <details key={q} className="group rounded-xl border border-line bg-white p-4 shadow-card">
                <summary className="cursor-pointer list-none font-semibold marker:hidden">{q}</summary>
                <p className="mt-2 text-sm text-muted">{a}</p>
              </details>
            ))}
          </div>
          <div className="mt-10 text-center"><LinkButton to="/signup" size="lg">Register Now</LinkButton></div>
        </div>
      </section>
    </>
  );
}
