import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, type = "text", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>}
        <input
          type={type}
          className={`flex h-10 w-full rounded-[var(--radius-sm)] border bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors 
          file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-muted)]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-daily)] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-red-500/50 focus-visible:ring-red-500' : 'border-[var(--border-subtle)]'} ${className}`}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
