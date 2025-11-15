import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, Star, User, Calendar, CheckCircle, XCircle, Eye } from 'lucide-react';

interface Review {
  id: string;
  user_name: string;
  product: string;
  product_name: string;
  order: string;
  rating: number;
  title: string;
  comment: string;
  image1: string;
  image2: string;
  image3: string;
  is_approved: boolean;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, ratingFilter]);

  const fetchReviews = async () => {
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.is_approved = statusFilter === 'approved';
      if (ratingFilter) params.rating = ratingFilter;

      const response = await api.get('/admin/reviews/', { params });
      setReviews(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    fetchReviews();
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/reviews/${id}/`, { is_approved: !currentStatus });
      setReviews(reviews.map(review =>
        review.id === id ? { ...review, is_approved: !currentStatus } : review
      ));
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review status');
    }
  };

  const deleteReview = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/admin/reviews/${id}/`);
        setReviews(reviews.filter(review => review.id !== id));
        alert('Review deleted successfully!');
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review');
      }
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
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
          <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
          
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
                  placeholder="Search reviews..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Reviews</p>
                <p className="text-2xl font-bold text-blue-900">{reviews.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-900">
                  {reviews.filter(r => r.is_approved).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Pending</p>
                <p className="text-2xl font-bold text-orange-900">
                  {reviews.filter(r => !r.is_approved).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
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
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{review.user_name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {review.title || review.comment.substring(0, 50) + '...'}
                        </div>
                        {review.is_verified_purchase && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{review.product_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-gray-600">({review.rating})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleApproval(review.id, review.is_approved)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        review.is_approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {review.is_approved ? 'Approved' : 'Pending'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div className="text-sm text-gray-900">
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="text-orange-600 hover:text-orange-900 inline-flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-500">No reviews match your current filters.</p>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Review Details</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="text-sm text-gray-900">{selectedReview.user_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product</label>
                  <p className="text-sm text-gray-900">{selectedReview.product_name}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <div className="flex items-center">
                  {renderStars(selectedReview.rating)}
                  <span className="ml-2 text-sm text-gray-600">({selectedReview.rating}/5)</span>
                </div>
              </div>
              
              {selectedReview.title && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="text-sm text-gray-900">{selectedReview.title}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Comment</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReview.comment}</p>
              </div>
              
              {(selectedReview.image1 || selectedReview.image2 || selectedReview.image3) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                  <div className="flex space-x-2">
                    {[selectedReview.image1, selectedReview.image2, selectedReview.image3]
                      .filter(Boolean)
                      .map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  {selectedReview.is_verified_purchase && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified Purchase
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    Helpful: {selectedReview.helpful_count}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(selectedReview.created_at)}
                </span>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedReview(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => toggleApproval(selectedReview.id, selectedReview.is_approved)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  selectedReview.is_approved
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {selectedReview.is_approved ? 'Unapprove' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;