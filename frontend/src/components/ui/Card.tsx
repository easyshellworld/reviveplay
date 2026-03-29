import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = false,
  ...props
}) => {
  return (
    <div className={`card ${glow ? 'glow' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};
