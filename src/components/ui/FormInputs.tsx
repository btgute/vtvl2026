'use client';

import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { FormFieldState } from './FormFeedbackPrimitives';

export function resolveControlStateClass(
  externalState: FormFieldState = 'default',
  isFocused: boolean,
  hasError: boolean,
  disabled?: boolean,
  readOnly?: boolean
): string {
  if (disabled) return 'vtvl-control vtvl-control-disabled';
  if (readOnly || externalState === 'readOnly') return 'vtvl-control vtvl-control-readonly';
  if (hasError || externalState === 'error') return 'vtvl-control vtvl-control-error';
  if (isFocused || externalState === 'focused') return 'vtvl-control vtvl-control-focused';
  return 'vtvl-control';
}

interface BaseControlProps {
  id: string;
  state?: FormFieldState;
  errorMessage?: string;
  errorId?: string;
  className?: string;
  onFocusChange?: (focused: boolean) => void;
}

export function TextInput({
  id,
  state = 'default',
  errorMessage,
  errorId,
  className = '',
  onFocusChange,
  onFocus,
  onBlur,
  disabled,
  readOnly,
  ...rest
}: BaseControlProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorMessage) || state === 'error';
  const isRo = Boolean(readOnly) || state === 'readOnly';
  const describedBy = hasError ? errorId || `${id}-error` : rest['aria-describedby'];

  return (
    <div className="relative flex items-center">
      <input
        id={id}
        disabled={disabled || state === 'disabled'}
        readOnly={isRo}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={describedBy}
        onFocus={(e) => {
          setFocused(true);
          onFocusChange?.(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onFocusChange?.(false);
          onBlur?.(e);
        }}
        className={`w-full h-10 rounded-lg px-3 text-sm font-normal ${resolveControlStateClass(
          state,
          focused,
          hasError,
          disabled || state === 'disabled',
          isRo
        )} ${isRo ? 'pr-8 font-mono font-medium text-[var(--primary)]' : ''} ${className}`}
        {...rest}
      />
      {isRo && (
        <Lock
          className="w-3.5 h-3.5 text-[var(--ink-subtle)] absolute right-2.5 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export function NumberInput({
  id,
  state = 'default',
  errorMessage,
  errorId,
  className = '',
  onFocusChange,
  onFocus,
  onBlur,
  disabled,
  readOnly,
  ...rest
}: BaseControlProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorMessage) || state === 'error';
  const isRo = Boolean(readOnly) || state === 'readOnly';
  const describedBy = hasError ? errorId || `${id}-error` : rest['aria-describedby'];

  return (
    <input
      id={id}
      type="number"
      disabled={disabled || state === 'disabled'}
      readOnly={isRo}
      aria-invalid={hasError ? true : undefined}
      aria-describedby={describedBy}
      onFocus={(e) => {
        setFocused(true);
        onFocusChange?.(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onFocusChange?.(false);
        onBlur?.(e);
      }}
      className={`w-full h-10 rounded-lg px-3 text-sm font-normal tabular-nums ${resolveControlStateClass(
        state,
        focused,
        hasError,
        disabled || state === 'disabled',
        isRo
      )} ${className}`}
      {...rest}
    />
  );
}

export function DateInput({
  id,
  state = 'default',
  errorMessage,
  errorId,
  className = '',
  onFocusChange,
  onFocus,
  onBlur,
  disabled,
  readOnly,
  ...rest
}: BaseControlProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorMessage) || state === 'error';
  const isRo = Boolean(readOnly) || state === 'readOnly';
  const describedBy = hasError ? errorId || `${id}-error` : rest['aria-describedby'];

  return (
    <input
      id={id}
      type="date"
      disabled={disabled || state === 'disabled'}
      readOnly={isRo}
      aria-invalid={hasError ? true : undefined}
      aria-describedby={describedBy}
      onFocus={(e) => {
        setFocused(true);
        onFocusChange?.(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onFocusChange?.(false);
        onBlur?.(e);
      }}
      className={`w-full h-10 rounded-lg px-3 text-sm font-normal ${resolveControlStateClass(
        state,
        focused,
        hasError,
        disabled || state === 'disabled',
        isRo
      )} ${className}`}
      {...rest}
    />
  );
}

export function Select({
  id,
  state = 'default',
  errorMessage,
  errorId,
  className = '',
  onFocusChange,
  onFocus,
  onBlur,
  disabled,
  children,
  ...rest
}: BaseControlProps & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorMessage) || state === 'error';
  const describedBy = hasError ? errorId || `${id}-error` : rest['aria-describedby'];

  return (
    <select
      id={id}
      disabled={disabled || state === 'disabled'}
      aria-invalid={hasError ? true : undefined}
      aria-describedby={describedBy}
      onFocus={(e) => {
        setFocused(true);
        onFocusChange?.(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onFocusChange?.(false);
        onBlur?.(e);
      }}
      className={`w-full h-10 rounded-lg px-3 text-sm font-normal ${resolveControlStateClass(
        state,
        focused,
        hasError,
        disabled || state === 'disabled',
        false
      )} ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}

/**
 * Ô chọn kết hợp danh mục gợi ý và tự gõ tìm kiếm (SearchableSelect dùng cho Mã ngạch chức danh)
 */
export function SearchableSelect({
  id,
  value,
  options,
  datalistId,
  placeholder = 'Nhập hoặc chọn từ danh mục',
  ariaLabelSelect,
  ariaLabelInput,
  state = 'default',
  onChange
}: {
  id: string;
  value: string;
  options: { code: string; label: string }[];
  datalistId: string;
  placeholder?: string;
  ariaLabelSelect: string;
  ariaLabelInput: string;
  state?: FormFieldState;
  onChange: (nextVal: string) => void;
}) {
  const matchedOption = options.some((o) => o.code === value) ? value : '';
  return (
    <div className="grid grid-cols-12 gap-1.5">
      <Select
        id={`${id}-preset`}
        aria-label={ariaLabelSelect}
        state={state}
        value={matchedOption}
        onChange={(e) => {
          if (e.target.value) onChange(e.target.value);
        }}
        className="col-span-12 sm:col-span-7 text-xs"
      >
        <option value="">— Chọn từ danh mục gợi ý —</option>
        {options.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </Select>
      <div className="col-span-12 sm:col-span-5">
        <TextInput
          id={id}
          aria-label={ariaLabelInput}
          list={datalistId}
          state={state}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="font-mono font-medium text-[var(--primary)] text-xs"
        />
      </div>
    </div>
  );
}
