import * as React from 'react';
import { cn } from './button';

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onValueChange: (val: number) => void;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 1, max = 10, step = 1, value, onValueChange, ...props }, ref) => {
    return (
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
        className={cn(
          'w-full h-6 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300',
          className
        )}
        {...props}
      />
    );
  }
);
Slider.displayName = 'Slider';
