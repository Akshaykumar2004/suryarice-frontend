import { ReactNode } from 'react';

interface MobileButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function MobileButton({
  children,
  onClick,
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  disabled = false,
  icon,
  className = '',
}: MobileButtonProps) {
  const baseClasses = 'rounded-2xl font-medium transition-all touch-manipulation active:scale-[0.98] flex items-center justify-center gap-3';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-gold to-[#c99d4a] text-white shadow-gold hover:shadow-gold-lg',
    secondary: 'bg-gradient-to-br from-deep-green to-[#0f4a38] text-white shadow-green',
    outline: 'bg-white text-deep-green border-2 border-deep-green shadow-soft-sm',
  };

  const sizeClasses = {
    sm: 'py-3 px-5 text-sm',
    md: 'py-4 px-6 text-base',
    lg: 'py-6 px-8 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      <span style={{ letterSpacing: '0.5px' }}>{children}</span>
    </button>
  );
}
