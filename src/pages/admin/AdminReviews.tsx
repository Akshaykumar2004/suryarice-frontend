import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Search, 
  Star, 
  User, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter, 
  ChevronDown,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  if (isLoading && !isRefreshing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchReviews();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = !searchQuery || 
      review.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || 
      (statusFilter === 'approved' && review.is_approved) ||
      (statusFilter === 'pending' && !review.is_approved);
    
    const matchesRating = !ratingFilter || 
      review.rating === parseInt(ratingFilter);
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customer Reviews</h1>
            <p className="text-gray-500 mt-1">Manage and moderate customer feedback</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleRefresh}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by user, product, or comment..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    >
                      <option value="">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <select
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    >
                      <option value="">All Ratings</option>
                      <option value="5">★★★★★ (5)</option>
                      <option value="4">★★★★☆ (4)</option>
                      <option value="3">★★★☆☆ (3)</option>
                      <option value="2">★★☆☆☆ (2)</option>
                      <option value="1">★☆☆☆☆ (1)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('');
                      setRatingFilter('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={handleSearch}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-50 text-blue-500">
                <Star className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{reviews.length}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-50 text-green-500">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {reviews.filter(r => r.is_approved).length}
                  <span className="ml-1 text-sm font-normal text-gray-500">
                    ({reviews.length ? Math.round((reviews.filter(r => r.is_approved).length / reviews.length) * 100) : 0}%)
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-50 text-orange-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {reviews.filter(r => !r.is_approved).length}
                  <span className="ml-1 text-sm font-normal text-gray-500">
                    ({reviews.length ? Math.round((reviews.filter(r => !r.is_approved).length / reviews.length) * 100) : 0}%)
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-50 text-yellow-500">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Rating</p>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-lg font-bold text-gray-900">
                    {reviews.length > 0 
                      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                      : '0.0'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      {/* Reviews List */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            {filteredReviews.length} {filteredReviews.length === 1 ? 'Review' : 'Reviews'}
            {searchQuery || statusFilter || ratingFilter ? ' found' : ''}
          </h2>
          <div className="text-sm text-gray-500">
            Sorted by: <span className="font-medium">Most Recent</span>
          </div>
        </div>
        
        {filteredReviews.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center"
          >
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter || ratingFilter 
                ? 'Try adjusting your search or filter criteria.'
                : 'There are no reviews to display at the moment.'}
            </p>
            {(searchQuery || statusFilter || ratingFilter) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setRatingFilter('');
                  handleSearch();
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start">
                      {/* User & Product Info */}
                      <div className="flex-1">
                        <div className="flex items-start">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="ml-4">
                            <div className="flex items-center flex-wrap">
                              <h3 className="text-base font-semibold text-gray-900">{review.user_name}</h3>
                              {review.is_verified_purchase && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <span>{review.product_name}</span>
                              <span className="mx-2">•</span>
                              <span>{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                            </div>
                            
                            <div className="mt-2 flex items-center">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-5 h-5 ${
                                      star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="ml-2 text-sm font-medium text-gray-500">
                                {review.rating.toFixed(1)} out of 5
                              </span>
                            </div>
                            
                            {review.title && (
                              <h4 className="mt-2 text-sm font-medium text-gray-900">{review.title}</h4>
                            )}
                            
                            {review.comment && (
                              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Review Images */}
                        {(review.image1 || review.image2 || review.image3) && (
                          <div className="mt-3 flex space-x-2 overflow-x-auto pb-2">
                            {[review.image1, review.image2, review.image3].map((img, i) => (
                              img && (
                                <div 
                                  key={i}
                                  className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 cursor-pointer"
                                  onClick={() => {
                                    // Handle image preview
                                    const images = [review.image1, review.image2, review.image3].filter(Boolean);
                                    // You can implement an image modal here
                                    console.log('Open image gallery:', images);
                                  }}
                                >
                                  <img 
                                    src={img} 
                                    alt={`Review ${i + 1}`} 
                                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                                  />
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="mt-4 sm:mt-0 sm:ml-4 flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
                        <button
                          onClick={() => toggleApproval(review.id, review.is_approved)}
                          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            review.is_approved
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          }`}
                        >
                          {review.is_approved ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1.5" />
                              Approved
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 mr-1.5" />
                              Pending
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1.5" />
                          View
                        </button>
                        
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-red-100 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <XCircle className="w-4 h-4 mr-1.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Pagination - You can implement this later */}
            {filteredReviews.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-xl">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                      <span className="font-medium">{filteredReviews.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Previous</span>
                        <ChevronDown className="h-5 w-5 transform rotate-90" aria-hidden="true" />
                      </button>
                      <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Next</span>
                        <ChevronDown className="h-5 w-5 transform -rotate-90" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
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