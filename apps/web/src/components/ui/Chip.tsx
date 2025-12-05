import React from 'react';

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

const Chip = ({ children, active = false, onClick, className = '' }: ChipProps) => {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors';

  const activeClasses = active
    ? 'bg-indigo-600 text-white'
    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white';

  const classes = `${baseClasses} ${activeClasses} ${className}`.trim();

  return (
    <span className={classes} onClick={onClick}>
      {children}
    </span>
  );
};

export default Chip;