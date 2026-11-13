import type { ComponentProps } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'accent';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';
const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  accent: 'bg-accent text-ink hover:bg-[#e6a600]',
  outline: 'border border-primary bg-white text-primary hover:bg-primary-50',
  ghost: 'text-primary hover:bg-primary-50',
  danger: 'border border-danger bg-white text-danger hover:bg-danger-50',
};
const sizes: Record<Size, string> = { md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' };

export const buttonClasses = (variant: Variant = 'primary', size: Size = 'md', extra = '') =>
  cn(base, variants[variant], sizes[size], extra);

interface ButtonProps extends ComponentProps<'button'> { variant?: Variant; size?: Size; loading?: boolean }

export function Button({ variant, size, loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function LinkButton({ variant, size, className, ...rest }: LinkProps & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClasses(variant, size, className)} {...rest} />;
}
