import { ArrowLeft, Heart, Share2, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showActions?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function MobileHeader({ 
  title, 
  showBack = false, 
  showActions = false,
  onBack,
  actions 
}: MobileHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-white shadow-sm safe-area-top">
      <div className="flex items-center justify-between px-6 py-5">
        {showBack ? (
          <button
            onClick={handleBack}
            className="w-12 h-12 rounded-full bg-beige flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
          >
            <ArrowLeft size={20} className="text-deep-green" />
          </button>
        ) : (
          <div className="w-12 h-12"></div>
        )}
        
        {title && (
          <h3 className="text-deep-green text-lg font-medium">{title}</h3>
        )}
        
        {showActions ? (
          <div className="flex gap-3">
            {actions || (
              <>
                <button className="w-12 h-12 rounded-full bg-beige flex items-center justify-center touch-manipulation active:scale-95 transition-transform">
                  <Heart size={20} className="text-deep-green" />
                </button>
                <button className="w-12 h-12 rounded-full bg-beige flex items-center justify-center touch-manipulation active:scale-95 transition-transform">
                  <Share2 size={20} className="text-deep-green" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="w-12 h-12"></div>
        )}
      </div>
    </div>
  );
}
