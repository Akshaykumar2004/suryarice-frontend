import { ReactNode } from 'react';
import { MandalaPattern } from './MandalaPattern';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  children?: ReactNode;
  height?: string;
}

export function HeroSection({
  title,
  subtitle,
  badge,
  description,
  children,
  height = 'h-[600px]',
}: HeroSectionProps) {
  return (
    <div className={`relative ${height} bg-gradient-to-br from-deep-green to-[#0f4a38] overflow-hidden`}>
      {/* Mandala Pattern Background */}
      <div className="absolute inset-0 text-gold">
        <MandalaPattern opacity={0.12} />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 pt-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            {subtitle && (
              <h3 className="text-gold text-sm tracking-widest opacity-90 uppercase">
                {subtitle}
              </h3>
            )}
            <h1 className="text-white mt-1 text-4xl font-semibold">{title}</h1>
          </div>
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center p-2">
            <img 
              src="/logo-removebg-preview.png" 
              alt="Surya Rice Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Hero Content */}
        <div className="mt-20">
          {badge && (
            <div className="inline-block px-6 py-2 rounded-full bg-gold/20 border border-gold/30 mb-6">
              <p className="text-gold text-sm">{badge}</p>
            </div>
          )}
          {description && (
            <p className="text-white/80 mb-8 max-w-md text-base">{description}</p>
          )}
          {children}
        </div>
      </div>

      {/* Decorative bottom curve */}
      <div className="absolute -bottom-1 left-0 right-0">
        <svg viewBox="0 0 1080 60" className="w-full text-beige-light" preserveAspectRatio="none">
          <path d="M 0,60 L 0,30 Q 540,0 1080,30 L 1080,60 Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
