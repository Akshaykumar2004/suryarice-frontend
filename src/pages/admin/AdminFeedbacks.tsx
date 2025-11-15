import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, MessageSquare, User, Calendar, CheckCircle, Clock } from 'lucide-react';

interface Feedback {
  id: string;
  user_name: string;
  order: string;
  feedback_type: string;
  subject: string;
  message: string;
  admin_response: string;
  is_resolved: boolean;
  resolved_at: string;
  created_at: string;
}

const AdminFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, [typeFilter, statusFilter]);

  const fetchFeedbacks = async () => {
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (typeFilter) params.feedback_type = typeFilter;
      if (statusFilter) params.is_resolved = statusFilter === 'resolved';

      const response = await api.get('/admin/feedback/', { params });
      setFeedbacks(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    fetchFeedbacks();
  };

  const handleRespond = async () => {
    if (!selectedFeedback || !adminResponse.trim()) return;

    setIsResponding(true);
    try {
      await api.patch(`/admin/feedback/${selectedFeedback.id}/`, {
        admin_response: adminResponse,
        is_resolved: true
      });

      setFeedbacks(feedbacks.map(feedback =>
        feedback.id === selectedFeedback.id
          ? { ...feedback, admin_response: adminResponse, is_resolved: true }
          : feedback
      ));

      setSelectedFeedback(null);
      setAdminResponse('');
      alert('Response sent successfully!');
    } catch (error) {
      console.error('Error sending response:', error);
      alert('Failed to send response');
    } finally {
      setIsResponding(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'complaint':
        return 'bg-red-100 text-red-800';
      case 'suggestion':
        return 'bg-blue-100 text-blue-800';
      case 'delivery':
        return 'bg-orange-100 text-orange-800';
      case 'quality':
        return 'bg-purple-100 text-purple-800';
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
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
          
          <div className="flex space-x-4">
            {/* Search */}
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search feedback..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Search
              </button>
            </div>

            {/* Filters */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Types</option>
              <option value="general">General</option>
              <option value="complaint">Complaint</option>
              <option value="suggestion">Suggestion</option>
              <option value="delivery">Delivery</option>
              <option value="quality">Quality</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Feedback</p>
                <p className="text-2xl font-bold text-blue-900">{feedbacks.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Pending</p>
                <p className="text-2xl font-bold text-orange-900">
                  {feedbacks.filter(f => !f.is_resolved).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Resolved</p>
                <p className="text-2xl font-bold text-green-900">
                  {feedbacks.filter(f => f.is_resolved).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Complaints</p>
                <p className="text-2xl font-bold text-red-900">
                  {feedbacks.filter(f => f.feedback_type === 'complaint').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User & Subject
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
              {feedbacks.map((feedback) => (
                <tr key={feedback.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{feedback.user_name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{feedback.subject}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(feedback.feedback_type)}`}>
                      {feedback.feedback_type.charAt(0).toUpperCase() + feedback.feedback_type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {feedback.is_resolved ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-500 mr-2" />
                      )}
                      <span className={`text-sm ${feedback.is_resolved ? 'text-green-600' : 'text-orange-600'}`}>
                        {feedback.is_resolved ? 'Resolved' : 'Pending'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div className="text-sm text-gray-900">
                        {formatDate(feedback.created_at)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedFeedback(feedback)}
                      className="text-orange-600 hover:text-orange-900 inline-flex items-center"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {feedback.is_resolved ? 'View' : 'Respond'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {feedbacks.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
            <p className="text-gray-500">No feedback matches your current filters.</p>
          </div>
        )}
      </div>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Feedback Details</h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="text-sm text-gray-900">{selectedFeedback.user_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedFeedback.feedback_type)}`}>
                    {selectedFeedback.feedback_type.charAt(0).toUpperCase() + selectedFeedback.feedback_type.slice(1)}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <p className="text-sm text-gray-900">{selectedFeedback.subject}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedFeedback.message}</p>
              </div>
              
              {selectedFeedback.admin_response && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Response</label>
                  <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded-lg">{selectedFeedback.admin_response}</p>
                </div>
              )}
              
              {!selectedFeedback.is_resolved && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Type your response here..."
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {!selectedFeedback.is_resolved && (
                <button
                  onClick={handleRespond}
                  disabled={isResponding || !adminResponse.trim()}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResponding ? 'Sending...' : 'Send Response'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbacks;