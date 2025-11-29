import { ReactNode } from 'react';

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'lg' | 'xl' | '2xl' | '3xl';
  onClick?: () => void;
}

export function MobileCard({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  rounded = '3xl',
  onClick,
}: MobileCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-soft-sm',
    md: 'shadow-soft',
    lg: 'shadow-soft-lg',
  };

  const roundedClasses = {
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  };

  const interactiveClass = onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : '';

  return (
    <div
      onClick={onClick}
      className={`
        bg-white
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${roundedClasses[rounded]}
        ${interactiveClass}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
