import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide font-mono">
          {label}
        </label>
      )}
      <input
        className={`
          w-full bg-[var(--bg-card2)] border border-[var(--border)] rounded-lg
          px-4 py-3 font-mono text-sm text-[var(--text-primary)]
          placeholder:text-[var(--text-muted)]
          focus:outline-none focus:border-[var(--dot-pink)]
          focus:shadow-[0_0_0_3px_var(--dot-pink-dim)]
          transition-all
          ${error ? 'border-[var(--error)]' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
