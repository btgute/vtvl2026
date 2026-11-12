'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

const PopoverContext = createContext<PopoverContextType | undefined>(undefined);

export interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Popover({ open: controlledOpen, onOpenChange, children }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const setOpen = (val: boolean) => {
    if (!isControlled) setUncontrolledOpen(val);
    onOpenChange?.(val);
  };

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block text-left">{children}</div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error('PopoverTrigger must be used within Popover');

  return (
    <div
      ref={ctx.triggerRef}
      onClick={() => ctx.setOpen(!ctx.open)}
      className={`cursor-pointer inline-flex items-center ${className}`}
      role="button"
      tabIndex={0}
      aria-expanded={ctx.open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          ctx.setOpen(!ctx.open);
        }
      }}
    >
      {children}
    </div>
  );
}

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export function PopoverContent({
  align = 'end',
  sideOffset = 8,
  className = '',
  children,
  ...props
}: PopoverContentProps) {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error('PopoverContent must be used within Popover');

  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ctx.open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        contentRef.current &&
        !contentRef.current.contains(target) &&
        ctx.triggerRef.current &&
        !ctx.triggerRef.current.contains(target)
      ) {
        ctx.setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') ctx.setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ctx]);

  if (!ctx.open) return null;

  const alignStyles = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0'
  }[align];

  return (
    <div
      ref={contentRef}
      style={{ marginTop: `${sideOffset}px` }}
      className={`absolute z-50 ${alignStyles} min-w-[240px] max-w-[calc(100vw-32px)] rounded-2xl border border-[#cbd5e1] bg-white p-4 text-[#004776] shadow-xl outline-none animate-in fade-in-0 zoom-in-95 duration-150 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function PopoverClose({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error('PopoverClose must be used within Popover');

  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(false)}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}

