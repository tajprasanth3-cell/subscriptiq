import clsx from 'clsx';

interface ProgressBarProps {
  value: number; // 0 - 100
  color?: 'indigo' | 'emerald' | 'amber' | 'rose';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar = ({
  value,
  color = 'indigo',
  size = 'md',
  className,
}: ProgressBarProps) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const colorStyles = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    rose: 'bg-rose-600',
  };

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div
      className={clsx(
        'w-full bg-slate-100 rounded-full overflow-hidden',
        sizeStyles[size],
        className
      )}
    >
      <div
        className={clsx('h-full rounded-full transition-all duration-500 ease-out', colorStyles[color])}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};
