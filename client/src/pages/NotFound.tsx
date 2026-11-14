import { LinkButton } from '../components/ui/Button';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-primary">404</p>
      <h1 className="mt-3 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">The page you are looking for does not exist or has moved.</p>
      <LinkButton to="/" size="lg" className="mt-6">Back to home</LinkButton>
    </section>
  );
}
