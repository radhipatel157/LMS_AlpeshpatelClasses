import { cn } from '@/lib/utils';

export function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full border px-2 text-xs font-medium capitalize',
        ['published', 'approved', 'evaluated', 'submitted'].includes(normalized) &&
          'border-success/30 bg-success/10 text-success',
        ['draft', 'pending'].includes(normalized) && 'border-warning/30 bg-warning/10 text-yellow-700 dark:text-warning',
        ['closed', 'archived', 'rejected'].includes(normalized) && 'border-danger/30 bg-danger/10 text-danger',
      )}
    >
      {value}
    </span>
  );
}
