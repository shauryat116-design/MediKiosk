import * as React from 'react';
import { cn } from './button';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' | 'vata' | 'pitta' | 'kapha';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary-100 text-primary-900 border-primary-300',
    secondary: 'bg-secondary-100 text-secondary-900 border-secondary-300',
    success: 'bg-green-100 text-green-800 border-green-300',
    destructive: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    vata: 'bg-vata-light text-vata-dark border-vata',
    pitta: 'bg-pitta-light text-pitta-dark border-pitta',
    kapha: 'bg-kapha-light text-kapha-dark border-kapha',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center px-4 py-1.5 rounded-full text-lg font-bold border-2 shadow-sm',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
