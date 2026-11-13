import type { ReactNode } from 'react';
import clsx from 'clsx';

export type BadgeVariant =
  | 'active'
  | 'near_limit'
  | 'suspended'
  | 'accepted'
  | 'duplicate'
  | 'rejected'
  | 'threshold'
  | 'renewal'
  | 'billing'
  | 'neutral'
  | 'info';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge = ({
  children,
  variant = 'neutral',
  className,
  size = 'md',
}: BadgeProps) => {
  const variantStyles: Record<BadgeVariant, string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    accepted: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    near_limit: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    threshold: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    duplicate: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    suspended: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
    rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
    billing: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
    renewal: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
    info: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
    neutral: 'bg-slate-100 text-slate-700 ring-1 ring-slate-600/10',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full tracking-wide transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
