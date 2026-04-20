import Link from 'next/link';
import { forwardRef } from 'react';

type Variant = 'primary' | 'ghost' | 'subtle' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-1.5 font-medium rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary:
    'text-text-primary bg-accent-brand hover:bg-accent-hover border border-transparent',
  ghost:
    'text-text-secondary bg-white/[0.02] border border-border hover:bg-white/[0.05] hover:text-text-primary',
  subtle:
    'text-text-secondary bg-transparent border border-transparent hover:bg-white/[0.04] hover:text-text-primary',
  danger:
    'text-text-primary bg-red-500/90 hover:bg-red-500 border border-transparent',
};

const sizes: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-8 px-3 text-[13px]',
  lg: 'h-9 px-4 text-[13px]',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;

type LinkProps = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'ghost', size = 'md', className = '', children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});

export function LinkButton({
  variant = 'ghost',
  size = 'md',
  className = '',
  href,
  target,
  rel,
  children,
}: LinkProps) {
  const external = href.startsWith('http');
  if (external) {
    return (
      <a
        href={href}
        target={target ?? '_blank'}
        rel={rel ?? 'noopener noreferrer'}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
