import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, Users, ShoppingCart, BarChart3, Settings, LogOut, Menu, X, Sun, MessageSquare, Star, Bell, Truck, Grid3x3 as Grid3X3, Tag, Images } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/secret/admin', icon: LayoutDashboard },
    { name: 'Orders', href: '/secret/admin/orders', icon: ShoppingCart },
    { name: 'Products', href: '/secret/admin/products', icon: Package },
    { name: 'Product Variants', href: '/secret/admin/product-variants', icon: Grid3X3 },
    { name: 'Product Images', href: '/secret/admin/product-images', icon: Images },
    { name: 'Categories', href: '/secret/admin/categories', icon: Tag },
    { name: 'Users', href: '/secret/admin/users', icon: Users },
    { name: 'Reviews', href: '/secret/admin/reviews', icon: Star },
    { name: 'Feedback', href: '/secret/admin/feedback', icon: MessageSquare },
    { name: 'Suppliers', href: '/secret/admin/suppliers', icon: Truck },
    { name: 'Notifications', href: '/secret/admin/notifications', icon: Bell },
    { name: 'Inventory', href: '/secret/admin/inventory', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === '/secret/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/secret/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-lg font-bold">SURYA</h1>
              <p className="text-xs text-orange-300 -mt-1">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto pt-8">
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300" />
              Sign Out
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="ml-4 lg:ml-0 text-2xl font-semibold text-gray-800">
                {navigation.find(item => isActive(item.href))?.name || 'Admin Panel'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name || 'Admin'}</span>
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;