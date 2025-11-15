import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  AlertTriangle,
  Calendar,
  BarChart3
} from 'lucide-react';

interface DashboardStats {
  total_orders: number;
  pending_orders: number;
  delivered_orders: number;
  total_revenue: number;
  total_users: number;
  low_stock_items: number;
  recent_orders: any[];
  top_products: any[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.total_revenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12.5%'
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: '+8.2%'
    },
    {
      title: 'Active Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'bg-purple-500',
      change: '+5.1%'
    },
    {
      title: 'Pending Orders',
      value: stats?.pending_orders || 0,
      icon: Clock,
      color: 'bg-orange-500',
      change: '-2.3%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  card.change.startsWith('+') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {card.change}
                </span>
                <span className="ml-2 text-gray-600">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Alert */}
      {stats?.low_stock_items && stats.low_stock_items > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-800 font-medium">
              {stats.low_stock_items} product(s) are running low on stock
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="p-6">
            {stats?.recent_orders?.length ? (
              <div className="space-y-4">
                {stats.recent_orders.slice(0, 5).map((order: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">#{order.order_number}</p>
                      <p className="text-sm text-gray-600">{order.total_items} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{order.total_amount}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No recent orders</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
          </div>
          <div className="p-6">
            {stats?.top_products?.length ? (
              <div className="space-y-4">
                {stats.top_products.slice(0, 5).map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium text-gray-900">{product.product_name}</p>
                        <p className="text-sm text-gray-600">{product.total_quantity} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{product.total_revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No sales data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            <Package className="w-5 h-5 mr-2" />
            Add Product
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <ShoppingCart className="w-5 h-5 mr-2" />
            View Orders
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            <BarChart3 className="w-5 h-5 mr-2" />
            Restock Items
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
            <Users className="w-5 h-5 mr-2" />
            User Reports
          </button>
        </div>
      </div>
    </div>
  );
};

// Clock icon component since it's missing from lucide-react
const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12,6 12,12 16,14"></polyline>
  </svg>
);

export default AdminDashboard;