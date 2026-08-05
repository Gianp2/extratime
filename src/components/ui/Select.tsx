import React, { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full bg-white dark:bg-zinc-950 border text-zinc-900 dark:text-zinc-100 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 px-3.5 py-2.5 ${
            error
              ? 'border-rose-500 dark:border-rose-500/80 focus:ring-rose-500'
              : 'border-zinc-200 dark:border-zinc-800'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
