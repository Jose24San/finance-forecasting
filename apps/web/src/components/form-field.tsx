'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export function FormField({
  label,
  error,
  children,
  className,
  required = false,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {children}
        {error && (
          <div className="absolute -bottom-5 left-0 text-xs text-red-600 flex items-center gap-1">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function FormInput({ error, className, ...props }: FormInputProps) {
  return (
    <input
      className={cn(
        'w-full p-2 border rounded-md transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
        error
          ? 'border-red-500 focus:ring-red-500'
          : 'border-gray-300 hover:border-gray-400',
        className
      )}
      {...props}
    />
  );
}

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  children: React.ReactNode;
}

export function FormSelect({
  error,
  className,
  children,
  ...props
}: FormSelectProps) {
  return (
    <select
      className={cn(
        'w-full p-2 border rounded-md transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
        error
          ? 'border-red-500 focus:ring-red-500'
          : 'border-gray-300 hover:border-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
