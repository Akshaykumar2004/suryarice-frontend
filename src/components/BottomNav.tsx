import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BottomNavProps {
  cartCount?: number;
}

export function BottomNav({ cartCount = 0 }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/', key: 'home' },
    { icon: ShoppingBag, label: 'Products', path: '/products', key: 'products' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', key: 'cart', badge: cartCount },
    { icon: User, label: 'Profile', path: '/profile', key: 'profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] safe-area-bottom">
      <div className="max-w-[1080px] mx-auto">
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 relative touch-manipulation active:scale-95 transition-transform"
              >
                <div className="relative">
                  <Icon
                    size={24}
                    className={`transition-colors ${
                      active ? 'text-gold' : 'text-gray-600'
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {item.badge && item.badge > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-maroon text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white">
                      {item.badge > 9 ? '9+' : item.badge}
                    </div>
                  )}
                </div>
                <span
                  className={`text-xs transition-colors ${
                    active ? 'text-gold font-medium' : 'text-gray-600'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
