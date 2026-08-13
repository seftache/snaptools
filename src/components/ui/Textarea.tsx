import { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, rows = 3, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>}
        <textarea
          rows={rows}
          className={`flex w-full rounded-[var(--radius-sm)] border bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors 
          placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-daily)] focus-visible:ring-offset-0 
          disabled:cursor-not-allowed disabled:opacity-50 resize-y
          ${error ? 'border-red-500/50 focus-visible:ring-red-500' : 'border-[var(--border-subtle)]'} ${className}`}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
