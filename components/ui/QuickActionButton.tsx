import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  label: string;
  variant?: 'default' | 'danger' | 'success' | 'primary';
  size?: 'sm' | 'md';
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon: Icon,
  onClick,
  label,
  variant = 'default',
  size = 'md'
}) => {
  const variants = {
    default: 'hover:bg-blue-100 text-slate-600 hover:text-blue-600',
    primary: 'hover:bg-blue-100 text-blue-600 hover:text-blue-700 bg-blue-50',
    danger: 'hover:bg-red-100 text-red-600 hover:text-red-700',
    success: 'hover:bg-green-100 text-green-600 hover:text-green-700'
  };

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2'
  };

  const iconSizes = {
    sm: 16,
    md: 18
  };

  return (
    <div className="relative group">
      <button 
        onClick={onClick} 
        className={`${sizes[size]} rounded-lg transition-colors ${variants[variant]}`}
        title={label}
      >
        <Icon size={iconSizes[size]} />
      </button>
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {label}
      </div>
    </div>
  );
};

export default QuickActionButton;
