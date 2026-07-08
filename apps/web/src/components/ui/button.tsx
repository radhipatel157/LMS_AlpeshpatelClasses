import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'icon';
};

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md border font-medium transition disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'icon' && 'h-9 w-9',
        variant === 'primary' && 'border-primary bg-primary text-primary-foreground hover:opacity-90',
        variant === 'secondary' && 'border-border bg-card text-foreground hover:bg-muted',
        variant === 'ghost' && 'border-transparent bg-transparent text-foreground hover:bg-muted',
        variant === 'danger' && 'border-danger bg-danger text-white hover:opacity-90',
        className,
      )}
      {...props}
    />
  );
}
