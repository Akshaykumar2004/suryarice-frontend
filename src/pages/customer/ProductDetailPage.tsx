import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Star,
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,
  Sun,
} from 'lucide-react';
import ProductImageCarousel, { CarouselImageInput } from '../../components/ProductImageCarousel';

interface ProductVariant {
  id: string;
  weight: number;
  weight_unit: string;
  price: number;
  discount_price?: number;
  effective_price: number;
  stock_quantity: number;
  is_available: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image: string | null;
  brand: string;
  origin: string;
  category: string;
  variants: ProductVariant[];
  average_rating: number;
  total_reviews: number;
  images?: CarouselImageInput[];
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Debug: Log when reviews state changes
  useEffect(() => {
    console.log('Reviews state changed:', reviews.length, reviews);
  }, [reviews]);
  
  const fetchReviews = async () => {
    if (!id) return;
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      console.log(`Fetching reviews for product ID: ${id}`);
      
      // Try the product-specific reviews endpoint (DRF custom action)
      const response = await api.get(`/products/${id}/reviews/`);
      
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));
      
      // Handle both array and object with results property
      let reviewsData;
      if (Array.isArray(response.data)) {
        reviewsData = response.data;
        console.log('Using direct array, length:', reviewsData.length);
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        reviewsData = response.data.results;
        console.log('Using results property, length:', reviewsData.length);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        reviewsData = response.data.data;
        console.log('Using nested data property, length:', reviewsData.length);
      } else {
        console.warn('Unexpected response format:', response.data);
        reviewsData = [];
      }
      
      console.log('Final reviews data:', reviewsData);
      console.log('Setting reviews state with', reviewsData.length, 'reviews');
      setReviews(reviewsData);
      setReviewsError(null);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', error.config?.url);
      
      let errorMessage = 'Failed to load reviews';
      
      // If the endpoint doesn't exist (404) or returns 403/401
      if (error.response?.status === 404) {
        errorMessage = 'Reviews endpoint not found';
        console.warn('Reviews endpoint returned 404 - endpoint may not exist or product not found');
      } else if (error.response?.status === 403 || error.response?.status === 401) {
        errorMessage = 'Authentication required to view reviews';
        console.warn('Reviews endpoint returned', error.response?.status, '- authentication may be required');
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error when fetching reviews';
        console.error('Server error when fetching reviews');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setReviews([]);
      setReviewsError(errorMessage);
    } finally {
      setReviewsLoading(false);
      // Use a callback to log the actual state after it updates
      setTimeout(() => {
        console.log('Reviews state after update:', { reviews: reviews.length, error: reviewsError });
      }, 100);
    }
  };

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}/`);
      setProduct(data);
      const availableVariant = data.variants.find((v: ProductVariant) => v.is_available);
      setSelectedVariant(availableVariant || data.variants[0]);
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !product) return;
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsAddingToCart(true);
    try {
      const cartImage =
        product.images?.[0]?.image || product.image;

      addToCart({
        id: `${product.id}-${selectedVariant.id}`,
        productId: product.id,
        variantId: selectedVariant.id,
        productName: product.name,
        variantName: `${selectedVariant.weight}${selectedVariant.weight_unit}`,
        weight: `${selectedVariant.weight}${selectedVariant.weight_unit}`,
        price: selectedVariant.effective_price,
        image: cartImage,
      });

      alert('✅ Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const updateQuantity = (change: number) => {
    const newQuantity = quantity + change;
    if (
      newQuantity >= 1 &&
      (!selectedVariant || newQuantity <= selectedVariant.stock_quantity)
    ) {
      setQuantity(newQuantity);
    }
  };

  // Skeleton loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col gap-6 p-6 animate-pulse">
        <div className="bg-gray-200 h-64 w-full rounded-xl" />
        <div className="space-y-3">
          <div className="bg-gray-200 h-6 w-3/4 rounded" />
          <div className="bg-gray-200 h-4 w-1/2 rounded" />
          <div className="bg-gray-200 h-4 w-1/3 rounded" />
        </div>
        <div className="bg-gray-200 h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <Sun className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Product not found</h2>
        <button
          onClick={() => navigate('/products')}
          className="text-orange-500 hover:text-orange-600 font-medium transition"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="pb-44 md:pb-8 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-3 md:p-4 flex items-center sticky top-0 z-10 safe-area-top shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 truncate">
          {product.name}
        </h1>
      </div>

      {/* Product Images */}
      <ProductImageCarousel
        primaryImage={product.image}
        gallery={product.images}
        aspectClassName="aspect-square"
        className="bg-white"
        altFallback={product.name}
      />

      {/* Info Section */}
      <div className="bg-white p-4 md:p-6 rounded-t-3xl -mt-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

        {/* Ratings */}
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < Math.floor(product.average_rating || 0)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-2">
            ({product.average_rating?.toFixed(1) || '0.0'}) • {product.total_reviews} reviews
          </span>
        </div>

        {/* Details */}
        <div className="space-y-1 text-gray-700 text-sm">
          {product.brand && (
            <p>
              <span className="font-semibold">Brand:</span> {product.brand}
            </p>
          )}
          {product.origin && (
            <p>
              <span className="font-semibold">Origin:</span> {product.origin}
            </p>
          )}
          <p>
            <span className="font-semibold">Category:</span> {product.category}
          </p>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-5">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Variants */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Available Sizes</h3>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                disabled={!variant.is_available}
                className={`p-3 md:p-4 rounded-xl border-2 transition-all duration-200 touch-manipulation ${
                  selectedVariant?.id === variant.id
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : variant.is_available
                    ? 'border-gray-200 hover:border-orange-300 hover:bg-orange-50 active:scale-95'
                    : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-800">
                    {variant.weight}
                    {variant.weight_unit}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-orange-500">
                      ₹{variant.effective_price}
                    </span>
                    {variant.discount_price && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{variant.price}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {variant.is_available
                      ? `${variant.stock_quantity} in stock`
                      : 'Out of stock'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Selector */}
        {selectedVariant && selectedVariant.is_available && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Quantity</h3>
            <div className="flex items-center gap-4 md:gap-5">
              <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => updateQuantity(-1)}
                  disabled={quantity <= 1}
                  className="p-3 md:p-4 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <span className="px-4 md:px-6 font-bold text-base md:text-lg min-w-[3rem] text-center bg-gray-50">{quantity}</span>
                <button
                  onClick={() => updateQuantity(1)}
                  disabled={quantity >= selectedVariant.stock_quantity}
                  className="p-3 md:p-4 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              <div className="text-sm md:text-base text-gray-700 flex-1">
                Total:{' '}
                <span className="font-bold text-orange-500 text-lg md:text-xl">
                  ₹{(selectedVariant.effective_price * quantity).toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* Desktop Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="hidden md:flex w-full mt-6 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-4 rounded-xl items-center justify-center space-x-2 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed touch-manipulation min-h-[56px] shadow-lg"
            >
              {isAddingToCart ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                  <span className="ml-2">₹{(selectedVariant.effective_price * quantity).toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900">
            Customer Reviews
            {!reviewsLoading && reviews.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            )}
          </h3>
          
          {reviewsLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-400 border-t-transparent mb-2"></div>
              <p className="text-sm text-gray-500">Loading reviews...</p>
            </div>
          ) : reviewsError ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2 font-medium">Error loading reviews</p>
              <p className="text-sm text-gray-500">{reviewsError}</p>
              <button
                onClick={fetchReviews}
                className="mt-4 text-orange-500 hover:text-orange-600 font-medium text-sm"
              >
                Try Again
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-2">No reviews yet.</p>
              <p className="text-sm text-gray-500">Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-5">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-800 text-base md:text-lg">{review.user_name || 'Anonymous'}</p>
                        {review.is_verified_purchase && (
                          <span className="inline-flex items-center text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                            ✓ Verified Purchase
                          </span>
                        )}
                      </div>
                      {review.created_at && (
                        <p className="text-xs md:text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 md:w-5 md:h-5 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs md:text-sm text-gray-600 ml-1 font-medium">({review.rating})</span>
                    </div>
                  </div>
                  {review.title && (
                    <h4 className="font-bold text-gray-800 mb-2 text-base md:text-lg">{review.title}</h4>
                  )}
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-3">{review.comment}</p>
                  {(review.image1 || review.image2 || review.image3) && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {review.image1 && (
                        <img src={review.image1} alt="Review" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg shadow-sm cursor-pointer hover:scale-105 transition-transform" />
                      )}
                      {review.image2 && (
                        <img src={review.image2} alt="Review" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg shadow-sm cursor-pointer hover:scale-105 transition-transform" />
                      )}
                      {review.image3 && (
                        <img src={review.image3} alt="Review" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg shadow-sm cursor-pointer hover:scale-105 transition-transform" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Add to Cart - Above bottom nav */}
      {selectedVariant && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 safe-area-bottom z-[60]">
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant.is_available || isAddingToCart}
            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed touch-manipulation min-h-[56px] shadow-lg"
          >
            {isAddingToCart ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : selectedVariant.is_available ? (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
                <span className="ml-auto">₹{(selectedVariant.effective_price * quantity).toFixed(2)}</span>
              </>
            ) : (
              <span>Out of Stock</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
