import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';

  const variantClasses = {
    default: 'bg-gray-700 text-gray-200',
    primary: 'bg-indigo-600 text-white',
    secondary: 'bg-gray-600 text-gray-300',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return <span className={classes}>{children}</span>;
};

export default Badge;