import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCart, User, Package, X } from 'lucide-react';
import { BottomNav } from '../BottomNav';

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-beige-light">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 safe-area-top">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="flex justify-between items-center h-14 md:h-16 gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/logo-removebg-preview.png" 
                alt="Surya Rice Logo" 
                className="w-8 h-8 md:w-10 md:h-10 object-contain"
              />
              <div className="text-deep-green">
                <h1 className="text-lg md:text-xl font-bold">SURYA</h1>
                <p className="text-xs text-gold -mt-1 hidden md:block">Premium Rice</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-gold bg-beige' 
                    : 'text-deep-green hover:text-gold'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/products') 
                    ? 'text-gold bg-beige' 
                    : 'text-deep-green hover:text-gold'
                }`}
              >
                Products
              </Link>
              {user && (
                <Link 
                  to="/orders" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/orders') 
                      ? 'text-gold bg-beige' 
                      : 'text-deep-green hover:text-gold'
                  }`}
                >
                  Orders
                </Link>
              )}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-deep-green hover:text-gold transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute top-0 right-0 bg-maroon text-white text-xs rounded-full min-w-[18px] h-[18px] md:min-w-[20px] md:h-5 flex items-center justify-center px-1 font-bold shadow-lg border-2 border-white">
                    {getTotalItems() > 99 ? '99+' : getTotalItems()}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-deep-green hover:text-gold transition-colors touch-manipulation min-h-[44px]"
                  >
                    <div className="w-8 h-8 bg-beige rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="hidden md:block text-sm font-medium">{user.name || 'User'}</span>
                  </button>

                  {isMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 md:hidden"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                          <p className="text-xs text-gray-500">{user.mobile_number}</p>
                        </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3 text-gray-400" />
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Package className="w-4 h-4 mr-3 text-gray-400" />
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors touch-manipulation"
                      >
                        <X className="w-4 h-4 mr-3 text-red-400" />
                        Logout
                      </button>
                    </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="bg-gradient-to-r from-gold to-[#c99d4a] hover:shadow-gold text-white px-4 py-2 rounded-xl text-sm font-medium transition-all touch-manipulation min-h-[44px] flex items-center"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav cartCount={getTotalItems()} />
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default CustomerLayout;