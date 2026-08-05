import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-zinc-400 dark:text-zinc-500 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white dark:bg-zinc-950 border text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 ${
              leftIcon ? 'pl-9' : 'pl-3.5'
            } ${rightIcon ? 'pr-9' : 'pr-3.5'} py-2.5 ${
              error
                ? 'border-rose-500 dark:border-rose-500/80 focus:ring-rose-500'
                : 'border-zinc-200 dark:border-zinc-800'
            } ${className}`}
            {...props}
          />
          {rightIcon && <div className="absolute right-3 text-zinc-400 dark:text-zinc-500 flex items-center">{rightIcon}</div>}
        </div>
        {error && <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
