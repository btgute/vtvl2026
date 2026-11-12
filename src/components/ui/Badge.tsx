import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'slink' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
}

export function Badge({ className = '', variant = 'default', children, ...props }: BadgeProps) {
  const baseStyles =
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors whitespace-nowrap select-none';

  const variants: Record<string, string> = {
    default: 'bg-[#004776] text-white',
    slink: 'bg-[#006cee] text-white',
    secondary: 'bg-[#e1edf8] text-[#004776] border border-[#d0e4f5]',
    outline: 'border border-[#cbd5e1] text-[#004776] bg-white',
    success: 'bg-[#e3f5ec] text-[#13653f] border border-[#a3e2c3]',
    warning: 'bg-[#fdf2e1] text-[#8f4f00] border border-[#fbd39a]',
    destructive: 'bg-[#fdeceb] text-[#b42318] border border-[#f8b4af]'
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </span>
  );
}

