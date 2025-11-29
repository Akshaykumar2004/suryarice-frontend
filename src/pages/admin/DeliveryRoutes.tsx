import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MapPin, Package, Navigation, Filter, Truck, Clock, CheckCircle } from 'lucide-react';
import { getLocationFromPincode } from '../../data/locationData';

interface Order {
  id: string;
  order_number: string;
  user_name: string;
  user_mobile: string;
  status: string;
  total_amount: number;
  ordered_at: string;
  delivery_address?: string;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode?: string;
  delivery_area?: string;
}

interface AreaGroup {
  area: string;
  pincode: string;
  orders: Order[];
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalAmount: number;
}

const DeliveryRoutes = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [areaGroups, setAreaGroups] = useState<AreaGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending,confirmed,processing,out_for_delivery');

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders/');
      const ordersData = response.data.results || response.data;
      
      // Filter orders based on status
      const filteredOrders = statusFilter 
        ? ordersData.filter((order: Order) => statusFilter.split(',').includes(order.status))
        : ordersData;
      
      setOrders(filteredOrders);
      groupOrdersByArea(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupOrdersByArea = (ordersData: Order[]) => {
    const groupsMap = new Map<string, AreaGroup>();

    ordersData.forEach(order => {
      const pincode = order.delivery_pincode || 'N/A';
      if (pincode === 'N/A') return;

      // Use delivery_area if available, otherwise fallback to pincode lookup
      const area = order.delivery_area || getLocationFromPincode(pincode);
      const key = `${area}-${pincode}`; // Unique key combining area and pincode

      if (groupsMap.has(key)) {
        const group = groupsMap.get(key)!;
        group.orders.push(order);
        group.totalOrders += 1;
        group.totalAmount += Number(order.total_amount || 0); // Convert to number
        if (order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') {
          group.pendingOrders += 1;
        }
        if (order.status === 'delivered') {
          group.deliveredOrders += 1;
        }
      } else {
        groupsMap.set(key, {
          area,
          pincode,
          orders: [order],
          totalOrders: 1,
          pendingOrders: (order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') ? 1 : 0,
          deliveredOrders: order.status === 'delivered' ? 1 : 0,
          totalAmount: Number(order.total_amount || 0) // Convert to number
        });
      }
    });

    const groups = Array.from(groupsMap.values())
      .sort((a, b) => b.pendingOrders - a.pendingOrders);

    setAreaGroups(groups);
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const openInGoogleMaps = (area: string, pincode: string, address?: string) => {
    const query = address 
      ? encodeURIComponent(`${address}, ${pincode}`)
      : encodeURIComponent(`${area}, Bangalore, ${pincode}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const openRouteInGoogleMaps = (group: AreaGroup) => {
    // Create waypoints for all addresses in this pincode
    const addresses = group.orders
      .filter(o => o.delivery_address)
      .map(o => `${o.delivery_address}, ${group.pincode}`)
      .slice(0, 10); // Google Maps supports max 10 waypoints

    if (addresses.length === 0) {
      openInGoogleMaps(group.area, group.pincode);
      return;
    }

    const destination = encodeURIComponent(addresses[0]);
    const waypoints = addresses.slice(1).map(addr => encodeURIComponent(addr)).join('|');
    
    const url = waypoints 
      ? `https://www.google.com/maps/dir/?api=1&destination=${destination}&waypoints=${waypoints}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    
    window.open(url, '_blank');
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Navigation className="w-6 h-6 text-orange-500" />
              Delivery Route Planning
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Organize deliveries by area for efficient routing
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            >
              <option value="pending,confirmed,processing,out_for_delivery">Active Orders</option>
              <option value="pending">Pending Only</option>
              <option value="confirmed,processing">Confirmed & Processing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="">All Orders</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-600">Areas</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{areaGroups.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">Total Orders</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {areaGroups.reduce((sum, g) => sum + g.pendingOrders, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">Delivered</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {areaGroups.reduce((sum, g) => sum + g.deliveredOrders, 0)}
          </div>
        </div>
      </div>

      {/* Area Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {areaGroups.map((group) => (
          <div
            key={`${group.area}-${group.pincode}`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Group Header */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 border-b border-orange-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-bold text-gray-900">{group.area}</h3>
                  </div>
                  <p className="text-sm text-gray-600">PIN: {group.pincode}</p>
                </div>
                <button
                  onClick={() => openInGoogleMaps(group.area, group.pincode)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium border border-orange-200"
                >
                  <MapPin className="w-4 h-4" />
                  Map
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-gray-900">{group.totalOrders}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-orange-600">{group.pendingOrders}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-green-600">
                    ₹{group.totalAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-gray-600">Value</div>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">Orders ({group.orders.length})</h4>
                {group.orders.length > 1 && (
                  <button
                    onClick={() => openRouteInGoogleMaps(group)}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                  >
                    <Truck className="w-3 h-3" />
                    Plan Route
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {group.orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">#{order.order_number}</span>
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {formatStatus(order.status)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">{order.user_name}</div>
                        <div className="text-xs text-gray-500">{order.user_mobile}</div>
                        {selectedOrder === order.id && order.delivery_address && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-xs text-gray-700 whitespace-pre-wrap">{order.delivery_address}</div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openInGoogleMaps(group.area, group.pincode, order.delivery_address);
                              }}
                              className="mt-2 flex items-center gap-1 px-2 py-1 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600 transition-colors"
                            >
                              <Navigation className="w-3 h-3" />
                              Navigate
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-orange-600">
                          ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {areaGroups.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">No orders match your current filter criteria.</p>
        </div>
      )}

      {/* Map Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">Google Maps Integration</h4>
            <p className="text-sm text-blue-800">
              Click "Map" to view the area on Google Maps, or "Plan Route" to create an optimized delivery route for multiple orders in the same area.
              Click on individual orders to see full addresses and get navigation directions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryRoutes;
