import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-[var(--dot-pink)] text-white border-none hover:-translate-y-px hover:shadow-[0_4px_20px_var(--dot-pink-glow)]',
    secondary: 'bg-[var(--bg-card2)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--dot-pink)] hover:text-[var(--text-primary)]',
    success: 'bg-[var(--neon-green-dim)] text-[var(--success)] border border-[rgba(0,255,163,0.3)] hover:shadow-[0_4px_20px_rgba(0,255,163,0.3)]',
    outline: 'border-2 border-[var(--dot-pink)] text-[var(--dot-pink)] bg-transparent hover:bg-[var(--dot-pink-dim)]',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {variant === 'primary' && (
        <span className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent pointer-events-none rounded-lg" />
      )}
      {loading && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};
