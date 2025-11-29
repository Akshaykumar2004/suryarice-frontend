import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Search, Bell, User, Calendar, Eye, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  user: string;
  notification_type: string;
  title: string;
  message: string;
  order: string;
  order_number: string;
  is_read: boolean;
  read_at: string;
  created_at: string;
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    notification_type: 'general',
    title: '',
    message: '',
    user_id: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, [typeFilter, statusFilter]);

  const fetchNotifications = async () => {
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (typeFilter) params.notification_type = typeFilter;
      if (statusFilter) params.is_read = statusFilter === 'read';

      const response = await api.get('/admin/notifications/', { params });
      setNotifications(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    fetchNotifications();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/notifications/', formData);
      setShowModal(false);
      setFormData({
        notification_type: 'general',
        title: '',
        message: '',
        user_id: ''
      });
      fetchNotifications();
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    }
  };

  const deleteNotification = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await api.delete(`/admin/notifications/${id}/`);
        fetchNotifications();
        alert('Notification deleted successfully!');
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Failed to delete notification');
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order_confirmed':
        return 'bg-green-100 text-green-800';
      case 'order_dispatched':
        return 'bg-blue-100 text-blue-800';
      case 'order_delivered':
        return 'bg-purple-100 text-purple-800';
      case 'order_cancelled':
        return 'bg-red-100 text-red-800';
      case 'low_stock':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Notifications</h1>
              <button
                onClick={() => setShowModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 min-h-[44px] rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 min-h-[44px] rounded-lg transition-colors flex items-center justify-center"
                >
                  <Search className="w-5 h-5 md:hidden" />
                  <span className="hidden md:inline">Search</span>
                </button>
              </div>

              <div className="flex gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="flex-1 sm:flex-none border border-gray-300 rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                >
                  <option value="">All Types</option>
                  <option value="order_confirmed">Order Confirmed</option>
                  <option value="order_dispatched">Dispatched</option>
                  <option value="order_delivered">Delivered</option>
                  <option value="order_cancelled">Cancelled</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="general">General</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 sm:flex-none border border-gray-300 rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                >
                  <option value="">All Status</option>
                  <option value="read">Read</option>
                  <option value="unread">Unread</option>
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium">Total</p>
                <p className="text-xl font-bold text-blue-900">{notifications.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 font-medium">Read</p>
                <p className="text-xl font-bold text-green-900">{notifications.filter(n => n.is_read).length}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-600 font-medium">Unread</p>
                <p className="text-xl font-bold text-orange-900">{notifications.filter(n => !n.is_read).length}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600 font-medium">Today</p>
                <p className="text-xl font-bold text-purple-900">
                  {notifications.filter(n => new Date(n.created_at).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{notification.message}</p>
                </div>
                <Bell className={`w-5 h-5 flex-shrink-0 ml-2 ${notification.is_read ? 'text-gray-400' : 'text-orange-500'}`} />
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.notification_type)}`}>
                  {notification.notification_type.replace('_', ' ')}
                </span>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                  notification.is_read ? 'bg-gray-100 text-gray-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {notification.is_read ? (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Read
                    </>
                  ) : (
                    'Unread'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                <span className="text-gray-500">{formatDate(notification.created_at)}</span>
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-red-600 hover:text-red-800 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
              {notifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                        <Bell className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {notification.message}
                        </div>
                        {notification.order_number && (
                          <div className="text-xs text-blue-600 mt-1">
                            Order: {notification.order_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.notification_type)}`}>
                      {notification.notification_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {notification.is_read ? (
                        <Eye className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <Bell className="w-4 h-4 text-orange-500 mr-2" />
                      )}
                      <span className={`text-sm ${notification.is_read ? 'text-green-600' : 'text-orange-600'}`}>
                        {notification.is_read ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div className="text-sm text-gray-900">
                        {formatDate(notification.created_at)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>

          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">No notifications match your current filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Send Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Send New Notification
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.notification_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, notification_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="general">General</option>
                  <option value="order_confirmed">Order Confirmed</option>
                  <option value="order_dispatched">Order Dispatched</option>
                  <option value="order_delivered">Order Delivered</option>
                  <option value="order_cancelled">Order Cancelled</option>
                  <option value="low_stock">Low Stock</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.user_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Leave empty to send to all users"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      notification_type: 'general',
                      title: '',
                      message: '',
                      user_id: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 min-h-[44px] border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 min-h-[44px] rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;