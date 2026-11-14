import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { api } from '../api/endpoints';
import { event } from '../content/event';
import { contactSchema, type ContactForm } from '../lib/validation';
import { applyApiError } from '../lib/formErrors';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Field';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(''); setSent(false);
    try {
      await api.submitContact({ ...values, name: values.name.trim(), message: values.message.trim() });
      setSent(true);
      reset();
    } catch (err) {
      setFormError(applyApiError(err, setError, ['name', 'email', 'message']));
    }
  });

  return (
    <section className="bg-surface py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-5">
        <div className="space-y-4 md:col-span-2">
          <h1 className="text-3xl font-extrabold">Contact us</h1>
          <p className="text-muted">Questions about the hackathon, teams or registration? Send us a message and we will get back to you.</p>
          <Card className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-50 text-primary"><Mail className="size-5" aria-hidden /></span>
            <div>
              <p className="text-xs text-muted">Email us at</p>
              <a href={`mailto:${event.contactEmail}`} className="break-all text-sm font-semibold text-primary hover:underline">{event.contactEmail}</a>
            </div>
          </Card>
        </div>

        <Card className="p-6 sm:p-8 md:col-span-3">
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {sent && <Alert kind="success">Thanks! We have received your message.</Alert>}
            {formError && <Alert kind="error">{formError}</Alert>}
            <Input label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
            <Textarea label="Message" rows={5} error={errors.message?.message} {...register('message')} />
            <Button type="submit" size="lg" loading={isSubmitting}>Send message</Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
