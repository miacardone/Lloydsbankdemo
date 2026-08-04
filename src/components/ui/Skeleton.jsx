import { cn } from '@/lib/cn';

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-cf bg-surface-sunken motion-reduce:animate-none',
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-9 w-full" />
      ))}
    </div>
  );
}

export default Skeleton;
