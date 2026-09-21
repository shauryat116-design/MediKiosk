import * as React from 'react';
import { cn } from './button';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorColor?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorColor = 'bg-primary-600', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative h-5 w-full overflow-hidden rounded-full bg-gray-200 border border-gray-300', className)}
      {...props}
    >
      <div
        className={cn('h-full transition-all duration-500 ease-out rounded-full', indicatorColor)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
);
Progress.displayName = 'Progress';
