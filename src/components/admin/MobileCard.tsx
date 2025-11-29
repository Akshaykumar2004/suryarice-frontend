import { ReactNode } from 'react';

interface MobileCardProps {
  children: ReactNode;
  className?: string;
}

export function AdminMobileCard({ children, className = '' }: MobileCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3 ${className}`}>
      {children}
    </div>
  );
}

interface CardRowProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function AdminCardRow({ label, value, className = '' }: CardRowProps) {
  return (
    <div className={`flex justify-between items-start ${className}`}>
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <span className="text-sm text-gray-900 text-right ml-2">{value}</span>
    </div>
  );
}

interface CardActionsProps {
  children: ReactNode;
}

export function AdminCardActions({ children }: CardActionsProps) {
  return (
    <div className="flex gap-2 pt-2 border-t border-gray-100">
      {children}
    </div>
  );
}
