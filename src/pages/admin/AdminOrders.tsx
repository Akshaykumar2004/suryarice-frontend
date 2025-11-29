import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, Eye, Edit, Package, Clock, Truck, CheckCircle, XCircle, X, MapPin, Phone, User, CreditCard } from 'lucide-react';
import { getLocationFromPincode } from '../../data/locationData';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  order_number: string;
  user_name: string;
  user_mobile: string;
  user_email?: string;
  status: string;
  payment_status: string;
  payment_method?: string;
  total_amount: number;
  ordered_at: string;
  delivery_address?: string;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode?: string;
  delivery_area?: string;
  items?: OrderItem[];
  notes?: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;

      const response = await api.get('/admin/orders/', { params });
      let ordersData = response.data.results || response.data;
      
      // Apply status filter on frontend if backend doesn't support it
      if (statusFilter) {
        ordersData = ordersData.filter((order: Order) => order.status === statusFilter);
      }
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}/`);
      setViewingOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Fallback to basic order data
      const order = orders.find(o => o.id === orderId);
      if (order) setViewingOrder(order);
    }
  };

  const handleSearch = () => {
    fetchOrders();
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await api.post(`/admin/orders/${orderId}/update_status/`, { status: newStatus });
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      setSelectedOrder(null);
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'out_for_delivery':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Orders Management</h1>
              {(statusFilter || searchQuery) && (
                <p className="text-sm text-gray-500 mt-1">
                  {statusFilter && `Filtered by: ${formatStatus(statusFilter)}`}
                  {statusFilter && searchQuery && ' • '}
                  {searchQuery && `Search: "${searchQuery}"`}
                </p>
              )}
            </div>
            {(statusFilter || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setSearchQuery('');
                }}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search orders..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm md:text-base"
              >
                Search
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {orders.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{orders.length}</span> order{orders.length !== 1 ? 's' : ''}
          </span>
          <span className="text-sm text-gray-600">
            Total Value: <span className="font-semibold text-orange-600">
              ₹{orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0).toLocaleString('en-IN')}
            </span>
          </span>
        </div>
      )}

      {/* Orders Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{order.order_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.delivery_area || (order.delivery_pincode ? getLocationFromPincode(order.delivery_pincode) : order.delivery_city)}
                        {order.delivery_pincode && ` (${order.delivery_pincode})`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.user_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user_mobile}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{(order.total_amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.ordered_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => fetchOrderDetails(order.id)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-orange-600 hover:text-orange-900 inline-flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">No orders match your current filters.</p>
          </div>
        )}
      </div>

      {/* Orders Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-gray-900">
                  #{order.order_number}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {order.delivery_area || (order.delivery_pincode ? getLocationFromPincode(order.delivery_pincode) : order.delivery_city)}
                  {order.delivery_pincode && ` (${order.delivery_pincode})`}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {getStatusIcon(order.status)}
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {formatStatus(order.status)}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium text-gray-900">{order.user_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mobile:</span>
                <span className="font-medium text-gray-900">{order.user_mobile}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-orange-500">₹{(order.total_amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Date:</span>
                <span className="text-gray-500">{formatDate(order.ordered_at)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => fetchOrderDetails(order.id)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
              <button
                onClick={() => setSelectedOrder(order)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Update</span>
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">No orders match your current filters.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex items-center justify-between flex-shrink-0">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">Order Details</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">#{viewingOrder.order_number}</p>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-1">
              {/* Status & Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <div className="text-xs md:text-sm text-gray-600 mb-2">Order Status</div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(viewingOrder.status)}
                    <span className={`inline-flex px-2 md:px-3 py-1 text-xs md:text-sm font-semibold rounded-full ${getStatusColor(viewingOrder.status)}`}>
                      {formatStatus(viewingOrder.status)}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <div className="text-xs md:text-sm text-gray-600 mb-2">Payment Status</div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className={`inline-flex px-2 md:px-3 py-1 text-xs md:text-sm font-semibold rounded-full ${
                      viewingOrder.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {formatStatus(viewingOrder.payment_status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="border border-gray-200 rounded-lg p-3 md:p-4">
                <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs md:text-sm text-gray-600">Name</div>
                    <div className="font-medium text-sm md:text-base text-gray-900">{viewingOrder.user_name}</div>
                  </div>
                  <div>
                    <div className="text-xs md:text-sm text-gray-600">Mobile</div>
                    <div className="font-medium text-sm md:text-base text-gray-900 flex items-center gap-2">
                      <Phone className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                      <a href={`tel:${viewingOrder.user_mobile}`} className="hover:text-orange-600">
                        {viewingOrder.user_mobile}
                      </a>
                    </div>
                  </div>
                  {viewingOrder.user_email && (
                    <div className="md:col-span-2">
                      <div className="text-xs md:text-sm text-gray-600">Email</div>
                      <div className="font-medium text-sm md:text-base text-gray-900 break-all">{viewingOrder.user_email}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="border border-gray-200 rounded-lg p-3 md:p-4">
                <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                  Delivery Address
                </h4>
                <div className="space-y-1 text-sm md:text-base text-gray-900">
                  {viewingOrder.delivery_address && (
                    <div className="whitespace-pre-wrap leading-relaxed">{viewingOrder.delivery_address}</div>
                  )}
                  <div className="flex flex-wrap gap-1 md:gap-2 items-center mt-2 text-xs md:text-sm">
                    {viewingOrder.delivery_area && (
                      <>
                        <span className="font-semibold text-orange-600">{viewingOrder.delivery_area}</span>
                        <span className="text-gray-400">•</span>
                      </>
                    )}
                    {viewingOrder.delivery_pincode && !viewingOrder.delivery_area && (
                      <>
                        <span className="font-medium">{getLocationFromPincode(viewingOrder.delivery_pincode)}</span>
                        <span className="text-gray-400">•</span>
                      </>
                    )}
                    <span>{viewingOrder.delivery_city}</span>
                    <span className="text-gray-400">•</span>
                    <span>{viewingOrder.delivery_state}</span>
                    {viewingOrder.delivery_pincode && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="font-semibold text-gray-700">{viewingOrder.delivery_pincode}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {viewingOrder.items && viewingOrder.items.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-3 md:p-4">
                  <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                    Order Items
                  </h4>
                  <div className="space-y-2 md:space-y-3">
                    {viewingOrder.items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0 gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm md:text-base text-gray-900 break-words">{item.product_name}</div>
                          <div className="text-xs md:text-sm text-gray-500">
                            ₹{(item.price || 0).toLocaleString('en-IN')} × {item.quantity || 0}
                          </div>
                        </div>
                        <div className="font-semibold text-sm md:text-base text-gray-900 flex-shrink-0">
                          ₹{(item.total || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-orange-50 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 text-xs md:text-sm">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-medium text-gray-900 text-right">{formatDate(viewingOrder.ordered_at)}</span>
                </div>
                {viewingOrder.payment_method && (
                  <div className="flex items-center justify-between mb-2 text-xs md:text-sm">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium text-gray-900">{formatStatus(viewingOrder.payment_method)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-orange-200">
                  <span className="text-base md:text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-xl md:text-2xl font-bold text-orange-600">₹{(viewingOrder.total_amount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Notes */}
              {viewingOrder.notes && (
                <div className="border border-gray-200 rounded-lg p-3 md:p-4">
                  <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-2">Notes</h4>
                  <p className="text-xs md:text-sm text-gray-700 whitespace-pre-wrap">{viewingOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Actions - Fixed at bottom */}
            <div className="border-t border-gray-200 p-3 md:p-4 bg-white flex-shrink-0">
              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={() => {
                    setSelectedOrder(viewingOrder);
                    setViewingOrder(null);
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Update Status</span>
                </button>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Order Status
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Order #{selectedOrder.order_number}
            </p>
            
            <div className="space-y-3 mb-6">
              {['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateOrderStatus(selectedOrder.id, status)}
                  disabled={isUpdating || selectedOrder.status === status}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    selectedOrder.status === status
                      ? 'bg-orange-50 border-orange-200 text-orange-800'
                      : 'border-gray-200 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status)}
                    <span className="font-medium">{formatStatus(status)}</span>
                    {selectedOrder.status === status && (
                      <span className="text-xs text-orange-600">(Current)</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedOrder(null)}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;