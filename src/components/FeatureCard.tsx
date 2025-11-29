import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  color?: string;
}

export function FeatureCard({ icon: Icon, title, description, color = 'var(--gold)' }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft flex flex-col items-center text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={28} style={{ color }} strokeWidth={1.5} />
      </div>
      <p className="text-gray-800 text-sm font-medium">{title}</p>
      {description && (
        <p className="text-gray-600 text-xs mt-1">{description}</p>
      )}
    </div>
  );
}
