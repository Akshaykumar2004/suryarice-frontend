import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Package, Clock, Truck, CheckCircle, XCircle, Sun } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  ordered_at: string;
  expected_delivery_date: string;
  total_items: number;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      const params = selectedStatus ? { status: selectedStatus } : {};
      const response = await api.get('/orders/', { params });
      setOrders(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:p-6 safe-area-top shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Orders</h1>
        
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-4 py-2.5 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all touch-manipulation min-h-[44px] ${
              !selectedStatus
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
            }`}
          >
            All Orders
          </button>
          {['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2.5 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all touch-manipulation min-h-[44px] ${
                selectedStatus === status
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              {formatStatus(status)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No orders found</h2>
            <p className="text-gray-600 mb-8">
              {selectedStatus 
                ? `You don't have any ${formatStatus(selectedStatus).toLowerCase()} orders.`
                : "You haven't placed any orders yet. Start shopping to see your orders here!"
              }
            </p>
            <Link
              to="/products"
              className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-semibold transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md active:shadow-lg transition-all"
              >
                <Link
                  to={`/orders/${order.id}`}
                  className="block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        Order #{order.order_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {formatDate(order.ordered_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Items</p>
                      <p className="font-semibold text-gray-800">{order.total_items}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Amount</p>
                      <p className="font-semibold text-orange-500">₹{order.total_amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment</p>
                      <p className="font-semibold text-gray-800">
                        {order.payment_status === 'cod' ? 'Cash on Delivery' : formatStatus(order.payment_status)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expected Delivery</p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(order.expected_delivery_date)}
                      </p>
                    </div>
                  </div>
                </Link>

                {order.status === 'delivered' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      to={`/orders/${order.id}?review=true`}
                      className="text-orange-500 hover:text-orange-600 font-medium text-sm inline-block"
                    >
                      Rate & Review
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;