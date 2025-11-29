import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  Sun,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ProductVariant {
  id: string;
  weight: number;
  weight_unit: string;
  price: number;
  discount_price?: number;
  effective_price: number;
  stock_quantity: number;
  is_available: boolean;
  max_order_quantity: number;
}

interface CarouselImageInput {
  image: string;
  alt_text?: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedThumbnail, setSelectedThumbnail] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  useEffect(() => {
    console.log('Reviews state changed:', reviews.length, reviews);
  }, [reviews]);
  
  const fetchReviews = async () => {
    if (!id) return;
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      console.log(`Fetching reviews for product ID: ${id}`);
      
      const response = await api.get(`/products/${id}/reviews/`);
      
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));
      
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
      const cartImage = product.images?.[0]?.image || product.image;

      addToCart({
        id: `${product.id}-${selectedVariant.id}`,
        productId: product.id,
        variantId: selectedVariant.id,
        productName: product.name,
        variantName: `${selectedVariant.weight}${selectedVariant.weight_unit}`,
        weight: `${selectedVariant.weight}${selectedVariant.weight_unit}`,
        price: selectedVariant.effective_price,
        image: cartImage || undefined,
        max_order_quantity: selectedVariant.max_order_quantity,
      });

      alert('✅ Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getProductImages = () => {
    if (!product) return [];
    const images = [];
    if (product.image) images.push(product.image);
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => images.push(img.image));
    }
    return images.length > 0 ? images : ['/placeholder-product.png'];
  };

  const productImages = product ? getProductImages() : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    setSelectedThumbnail((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    setSelectedThumbnail((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
            <div>
              <div className="bg-gray-200 h-96 rounded-lg mb-4" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-200 h-20 w-20 rounded" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-200 h-8 w-3/4 rounded" />
              <div className="bg-gray-200 h-6 w-1/2 rounded" />
              <div className="bg-gray-200 h-32 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gray-50">
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
    <div className="min-h-screen bg-beige-light pb-44 md:pb-8">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-3 flex items-center sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-base font-semibold text-gray-800 truncate">
          {product.name}
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image Container */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 relative group">
              <div className="aspect-square flex items-center justify-center overflow-hidden bg-gray-50 rounded">
                <img
                  src={productImages[currentImageIndex]}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              {/* Image Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setSelectedThumbnail(index);
                    }}
                    className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded border-2 overflow-hidden transition-all ${
                      selectedThumbnail === index
                        ? 'border-orange-500 ring-2 ring-orange-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain bg-gray-50"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Desktop Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="hidden lg:flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="text-sm">Back</span>
            </button>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Product Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-deep-green mb-3">
                {product.name}
              </h1>

              {/* Ratings */}
              <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.average_rating || 0)
                          ? 'text-gold fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gold ml-2 hover:underline cursor-pointer font-medium">
                  {product.average_rating?.toFixed(1) || '0.0'} ({product.total_reviews} reviews)
                </span>
              </div>

              {/* Price */}
              {selectedVariant && (
                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-deep-green">
                      ₹{selectedVariant.effective_price}
                    </span>
                    {selectedVariant.discount_price && (
                      <>
                        <span className="text-lg text-gray-500 line-through">
                          ₹{selectedVariant.price}
                        </span>
                        <span className="text-sm font-semibold text-white bg-maroon px-2 py-1 rounded-full">
                          {Math.round(((selectedVariant.price - selectedVariant.effective_price) / selectedVariant.price) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Inclusive of all taxes</p>
                </div>
              )}

              {/* Product Details */}
              <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                {product.brand && (
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-24">Brand:</span>
                    <span className="text-sm text-gray-900 font-medium">{product.brand}</span>
                  </div>
                )}
                {product.origin && (
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-24">Origin:</span>
                    <span className="text-sm text-gray-900 font-medium">{product.origin}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="text-sm text-gray-600 w-24">Category:</span>
                  <span className="text-sm text-gray-900 font-medium">{product.category}</span>
                </div>
              </div>

              {/* Variants */}
              <div className="mb-6">
                <h3 className="text-base font-semibold mb-3 text-gray-900">Select Size:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={!variant.is_available}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        selectedVariant?.id === variant.id
                          ? 'border-gold bg-gold/10 shadow-soft-sm'
                          : variant.is_available
                          ? 'border-gray-200 hover:border-gold/50'
                          : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-deep-green">
                            {variant.weight}{variant.weight_unit}
                          </p>
                          <p className="text-sm font-bold text-gold mt-1">
                            ₹{variant.effective_price}
                          </p>
                        </div>
                        {!variant.is_available && (
                          <span className="text-xs text-maroon font-medium">Out of stock</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant?.is_available || isAddingToCart}
                  className="w-full bg-gradient-to-r from-gold to-[#c99d4a] hover:shadow-gold-lg text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-[0.98] shadow-gold"
                >
                  {isAddingToCart ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span style={{ letterSpacing: '0.5px' }}>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold mb-3 text-gray-900">About this item</h3>
                <p className="text-gray-700 leading-relaxed text-sm">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900">
            Customer Reviews
            {!reviewsLoading && reviews.length > 0 && (
              <span className="text-base font-normal text-gray-500 ml-2">
                ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
              </span>
            )}
          </h3>
          
          {reviewsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-400 border-t-transparent mb-3"></div>
              <p className="text-sm text-gray-500">Loading reviews...</p>
            </div>
          ) : reviewsError ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-red-600 mb-2 font-medium">Error loading reviews</p>
              <p className="text-sm text-gray-500 mb-4">{reviewsError}</p>
              <button
                onClick={fetchReviews}
                className="text-orange-500 hover:text-orange-600 font-medium text-sm"
              >
                Try Again
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-2">No reviews yet.</p>
              <p className="text-sm text-gray-500">Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold text-sm">
                            {(review.user_name || 'A').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.user_name || 'Anonymous'}</p>
                          {review.is_verified_purchase && (
                            <span className="text-xs text-green-600 font-medium">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {review.created_at && (
                        <p className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                  )}
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">{review.comment}</p>
                  {(review.image1 || review.image2 || review.image3) && (
                    <div className="flex gap-2 mt-3">
                      {review.image1 && (
                        <img 
                          src={review.image1} 
                          alt="Review" 
                          className="w-16 h-16 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" 
                        />
                      )}
                      {review.image2 && (
                        <img 
                          src={review.image2} 
                          alt="Review" 
                          className="w-16 h-16 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" 
                        />
                      )}
                      {review.image3 && (
                        <img 
                          src={review.image3} 
                          alt="Review" 
                          className="w-16 h-16 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" 
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar - Above Bottom Nav */}
      {selectedVariant && (
        <div className="lg:hidden fixed bottom-[90px] left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 z-40 safe-area-bottom">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-600">Price</p>
              <p className="text-xl font-bold text-deep-green">
                ₹{Number(selectedVariant.effective_price).toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant.is_available || isAddingToCart}
              className="flex-1 bg-gradient-to-r from-gold to-[#c99d4a] hover:shadow-gold text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isAddingToCart ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : selectedVariant.is_available ? (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span style={{ letterSpacing: '0.5px' }}>Add to Cart</span>
                </>
              ) : (
                <span>Out of Stock</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;