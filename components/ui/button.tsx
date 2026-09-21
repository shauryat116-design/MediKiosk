import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'vata' | 'pitta' | 'kapha';
  size?: 'sm' | 'md' | 'lg' | 'kiosk';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'kiosk', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold tracking-wide transition-all rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer';

    const variants = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/30',
      secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white shadow-lg shadow-secondary-600/30',
      outline: 'border-3 border-gray-300 bg-white hover:bg-gray-50 text-gray-900',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-800',
      destructive: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30',
      vata: 'bg-vata hover:bg-vata-dark text-white shadow-md shadow-vata/30',
      pitta: 'bg-pitta hover:bg-pitta-dark text-white shadow-md shadow-pitta/30',
      kapha: 'bg-kapha hover:bg-kapha-dark text-white shadow-md shadow-kapha/30',
    };

    const sizes = {
      sm: 'px-4 py-2 text-base min-h-[44px]',
      md: 'px-6 py-3 text-lg min-h-[52px]',
      lg: 'px-8 py-4 text-xl min-h-[64px]',
      kiosk: 'px-8 py-5 text-2xl min-h-[72px] w-full min-w-[200px]', // WCAG AAA Kiosk size
    };

    return (
      <button ref={ref} className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
