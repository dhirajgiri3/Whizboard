import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  label: string;
  variant?: 'default' | 'danger' | 'success' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
  status?: 'connected' | 'disconnected' | 'loading' | 'error';
  showStatusIndicator?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon: Icon,
  onClick,
  label,
  variant = 'default',
  size = 'md',
  className = '',
  status,
  showStatusIndicator = false,
  disabled = false,
  loading = false
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

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-gray-400';
      case 'loading':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusTooltip = () => {
    switch (status) {
      case 'connected':
        return 'Slack connected';
      case 'disconnected':
        return 'Slack not connected';
      case 'loading':
        return 'Checking connection...';
      case 'error':
        return 'Connection error';
      default:
        return label;
    }
  };

  return (
    <div className="relative group">
      <button 
        onClick={onClick} 
        className={`${sizes[size]} rounded-lg transition-colors ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        title={showStatusIndicator ? getStatusTooltip() : label}
        disabled={disabled || loading}
      >
        <div className="relative">
          {loading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Icon size={iconSizes[size]} />
          )}
          
          {/* Status indicator */}
          {showStatusIndicator && status && (
            <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-white ${getStatusColor()}`} />
          )}
        </div>
      </button>
      
      {/* Enhanced tooltip */}
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
        <div className="flex items-center gap-2">
          {showStatusIndicator && status && (
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          )}
          <span>{showStatusIndicator ? getStatusTooltip() : label}</span>
        </div>
        {/* Tooltip arrow */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
      </div>
    </div>
  );
};

export default QuickActionButton;
