import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Home, Search, ShoppingCart, User, Package, Sun, Menu, X } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-900 to-teal-800 shadow-lg sticky top-0 z-50 safe-area-top">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="flex justify-between items-center h-14 md:h-16 gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                <Sun className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-lg md:text-xl font-bold">SURYA</h1>
                <p className="text-xs text-orange-300 -mt-1 hidden md:block">Premium Rice</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-orange-400 bg-teal-800' 
                    : 'text-white hover:text-orange-300'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/products') 
                    ? 'text-orange-400 bg-teal-800' 
                    : 'text-white hover:text-orange-300'
                }`}
              >
                Products
              </Link>
              {user && (
                <Link 
                  to="/orders" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/orders') 
                      ? 'text-orange-400 bg-teal-800' 
                      : 'text-white hover:text-orange-300'
                  }`}
                >
                  Orders
                </Link>
              )}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-white hover:text-orange-300 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-xs rounded-full min-w-[18px] h-[18px] md:min-w-[20px] md:h-5 flex items-center justify-center px-1 font-bold shadow-md">
                    {getTotalItems() > 99 ? '99+' : getTotalItems()}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-white hover:text-orange-300 transition-colors touch-manipulation min-h-[44px]"
                  >
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
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
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation min-h-[44px] flex items-center"
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-bottom">
        <div className="grid grid-cols-4 h-16 px-2 max-w-screen-sm mx-auto">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center space-y-1 touch-manipulation transition-colors ${
              isActive('/') ? 'text-orange-500' : 'text-gray-500'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            to="/products"
            className={`flex flex-col items-center justify-center space-y-1 touch-manipulation transition-colors ${
              isActive('/products') ? 'text-orange-500' : 'text-gray-500'
            }`}
          >
            <Search className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Products</span>
          </Link>
          <Link
            to="/cart"
            className={`flex flex-col items-center justify-center space-y-1 relative touch-manipulation transition-colors ${
              isActive('/cart') ? 'text-orange-500' : 'text-gray-500'
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 mb-1" />
            {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium">
                {getTotalItems()}
              </span>
            )}
            </div>
            <span className="text-xs font-medium">Cart</span>
          </Link>
          <Link
            to={user ? "/orders" : "/auth"}
            className={`flex flex-col items-center justify-center space-y-1 touch-manipulation transition-colors ${
              isActive('/orders') || isActive('/profile') || isActive('/auth') ? 'text-orange-500' : 'text-gray-500'
            }`}
          >
            {user ? <Package className="w-5 h-5 mb-1" /> : <User className="w-5 h-5 mb-1" />}
            <span className="text-xs font-medium">{user ? 'Orders' : 'Login'}</span>
          </Link>
        </div>
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