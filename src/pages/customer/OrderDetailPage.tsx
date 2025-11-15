import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, Star, MapPin, Phone, Calendar } from 'lucide-react';

interface OrderItem {
  id: string;
  product_variant: string;
  product?: string;
  product_id?: string;
  product_name: string;
  variant_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  ordered_at: string;
  expected_delivery_date: string;
  total_items: number;
  delivery_name: string;
  delivery_mobile: string;
  delivery_address_line1: string;
  delivery_address_line2?: string;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  delivery_landmark?: string;
  notes?: string;
  items?: OrderItem[];
  order_items?: OrderItem[]; // Alternative field name some APIs use
}

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [orderReviewed, setOrderReviewed] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder();
      checkOrderReviewStatus();
      // Check if we should show review modal (from URL params or state)
      const urlParams = new URLSearchParams(location.search);
      if (urlParams.get('review') === 'true' && !orderReviewed) {
        setShowReviewModal(true);
      }
    }
  }, [id, location.search]);
  
  const checkOrderReviewStatus = async () => {
    try {
      const response = await api.get('/reviews/', { params: { order: id } });
      const reviews = response.data.results || response.data;
      if (reviews && reviews.length > 0) {
        setOrderReviewed(true);
      }
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  };

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/orders/${id}/`);
      const orderData = response.data;
      
      // Handle different possible API response structures
      // Some APIs return 'order_items' instead of 'items'
      if (!orderData.items && orderData.order_items) {
        orderData.items = orderData.order_items;
      }
      
      // Ensure items is always an array
      if (!Array.isArray(orderData.items)) {
        orderData.items = [];
      }
      
      // Convert DecimalField strings to numbers (Django REST Framework returns DecimalField as strings)
      // Helper function to safely convert to number
      const toNumber = (value: any): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const parsed = parseFloat(value);
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      };
      
      // Convert order amount fields
      orderData.total_amount = toNumber(orderData.total_amount);
      if (orderData.subtotal !== undefined) orderData.subtotal = toNumber(orderData.subtotal);
      if (orderData.delivery_charge !== undefined) orderData.delivery_charge = toNumber(orderData.delivery_charge);
      if (orderData.discount !== undefined) orderData.discount = toNumber(orderData.discount);
      
      // Convert item prices from strings to numbers
      if (orderData.items) {
        orderData.items = orderData.items.map((item: any) => ({
          ...item,
          unit_price: toNumber(item.unit_price),
          total_price: toNumber(item.total_price),
          quantity: typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : (item.quantity || 1),
          weight: toNumber(item.weight),
        }));
      }
      
      setOrder(orderData as Order);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load order details';
      alert(errorMessage);
      navigate('/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      alert('Please fill in all review fields');
      return;
    }

    setIsSubmittingReview(true);
    try {
      // Submit review for the order (backend will create reviews for all products)
      // We can use the first product ID, but backend uses order to find all products
      const orderItems = order?.items || order?.order_items || [];
      const firstItem = orderItems[0];
      const productId = firstItem?.product_id || firstItem?.product;
      
      if (!productId) {
        alert('Product information not available');
        setIsSubmittingReview(false);
        return;
      }
      
      await api.post('/reviews/', {
        product: productId, // Backend uses this but actually uses order to find all products
        order: id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });
      alert('Thank you for your review! Your feedback has been submitted for all products in this order.');
      setShowReviewModal(false);
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      setSelectedProductId(null);
      setOrderReviewed(true);
      fetchOrder(); // Refresh order data
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Failed to submit review';
      
      // Handle validation errors
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'object') {
          // Handle field-specific errors
          const fieldErrors = Object.keys(errorData).map(key => {
            const value = errorData[key];
            if (Array.isArray(value)) {
              return `${key}: ${value.join(', ')}`;
            }
            return `${key}: ${value}`;
          }).join('\n');
          errorMessage = fieldErrors || errorMessage;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmittingReview(false);
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
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if invalid date
      }
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original string on error
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order not found</h2>
          <Link to="/orders" className="text-orange-500 hover:text-orange-600">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:p-6 sticky top-0 z-10 safe-area-top shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Order #{order.order_number}
            </h1>
            <p className="text-sm text-gray-600">Placed on {formatDate(order.ordered_at)}</p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(order.status)}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {formatStatus(order.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Order Success Message */}
        {location.state?.orderPlaced && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-800">Order Placed Successfully!</h3>
                <p className="text-sm text-green-700">Your order has been confirmed. We'll notify you when it ships.</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  {item.product_image && (
                    <img
                      src={item.product_image}
                      alt={item.product_name || 'Product'}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.product_name || 'Product'}</h3>
                    {item.variant_name && (
                      <p className="text-sm text-gray-600">{item.variant_name}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
                      <p className="font-semibold text-gray-800">₹{Number(item.total_price || 0).toFixed(2)}</p>
                    </div>
                    {/* Remove individual item review button since we review the whole order */}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-4">No items found in this order.</p>
            )}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Delivery Address
          </h2>
          <div className="space-y-2 text-gray-700">
            <p className="font-semibold">{order.delivery_name}</p>
            <p className="flex items-center text-sm">
              <Phone className="w-4 h-4 mr-2" />
              {order.delivery_mobile}
            </p>
            <p className="text-sm">
              {order.delivery_address_line1}
              {order.delivery_address_line2 && `, ${order.delivery_address_line2}`}
            </p>
            <p className="text-sm">
              {order.delivery_city}, {order.delivery_state} - {order.delivery_pincode}
            </p>
            {order.delivery_landmark && (
              <p className="text-sm text-gray-600">Landmark: {order.delivery_landmark}</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Items ({order.total_items || 0})</span>
              <span>₹{Number(order.total_amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charges</span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Payment Method</span>
              <span>{order.payment_status === 'cod' ? 'Cash on Delivery' : formatStatus(order.payment_status || '')}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-800">
              <span>Total</span>
              <span className="text-orange-500">₹{Number(order.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Expected Delivery: {formatDate(order.expected_delivery_date)}</span>
          </div>
        </div>

        {/* Rate & Review Section for Delivered Orders */}
        {order.status === 'delivered' && !orderReviewed && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Rate Your Experience</h2>
            <p className="text-gray-600 mb-4">
              Help us improve by sharing your feedback. Your review will be posted for all products in this order.
            </p>
            <button
              onClick={() => setShowReviewModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Write a Review
            </button>
          </div>
        )}
        
        {/* Show message if order already reviewed */}
        {order.status === 'delivered' && orderReviewed && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 md:p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-800">Thank You!</h3>
                <p className="text-sm text-green-700">You have already reviewed this order.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Write a Review</h2>
            
            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= reviewRating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Give your review a title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewTitle('');
                  setReviewComment('');
                  setReviewRating(5);
                  setSelectedProductId(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={isSubmittingReview || !order || (order.items && order.items.length === 0)}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
