import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'slink' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', type = 'button', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-xl font-semibold transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#006cee] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98] select-none';

    const variants: Record<string, string> = {
      default: 'bg-[#004776] hover:bg-[#00385c] text-white shadow-xs',
      slink: 'bg-[#006cee] hover:bg-[#005ecc] text-white shadow-xs hover:shadow-md',
      secondary: 'bg-[#e1edf8] hover:bg-[#d0e4f5] text-[#004776]',
      outline: 'border border-[#cbd5e1] hover:border-[#006cee] bg-white text-[#004776] hover:bg-[#f8fafc]',
      ghost: 'hover:bg-[#f1f5f9] text-[#004776]',
      destructive: 'bg-[#b42318] hover:bg-[#911b12] text-white shadow-xs'
    };

    const sizes: Record<string, string> = {
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
      default: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5 rounded-2xl',
      icon: 'h-10 w-10 p-0 shrink-0'
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

