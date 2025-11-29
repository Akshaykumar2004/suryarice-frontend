import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package, Star, TrendingUp } from 'lucide-react';
import ProductImageCarousel from '../../components/ProductImageCarousel';
import { MobileCard } from '../../components/MobileCard';
import { MobileButton } from '../../components/MobileButton';

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, getTotalItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (variantId: string, newQuantity: number, maxQuantity?: number) => {
    if (newQuantity <= 0) {
      removeFromCart(variantId);
    } else if (maxQuantity && newQuantity > maxQuantity) {
      alert(`Maximum order quantity is ${maxQuantity} for this product`);
    } else {
      updateQuantity(variantId, newQuantity);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-beige-light pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto px-6 pt-12">
          {/* Empty Cart Illustration */}
          <div className="text-center mb-12">
            <div className="w-32 h-32 bg-gradient-to-br from-gold to-[#c99d4a] rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold">
              <ShoppingBag className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-deep-green mb-3">Your cart is empty</h2>
            <p className="text-gray-600 text-base leading-relaxed">
              Looks like you haven't added any items yet. 
              Start shopping to fill your cart with premium rice!
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 mb-8">
            <MobileButton
              variant="primary"
              size="lg"
              fullWidth
              icon={<ShoppingBag size={20} />}
              onClick={() => navigate('/products')}
            >
              Browse Products
            </MobileButton>

            {user && (
              <MobileButton
                variant="outline"
                size="lg"
                fullWidth
                icon={<Package size={20} />}
                onClick={() => navigate('/orders')}
              >
                View My Orders
              </MobileButton>
            )}
          </div>

          {/* Suggestions */}
          <div className="mt-12">
            <h3 className="text-deep-green text-xl font-semibold mb-6">Why Choose Surya Rice?</h3>
            <div className="space-y-4">
              <MobileCard padding="md" shadow="sm" rounded="2xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Star size={24} className="text-gold" />
                  </div>
                  <div>
                    <h4 className="text-deep-green font-semibold mb-1">Premium Quality</h4>
                    <p className="text-gray-600 text-sm">
                      Handpicked and carefully processed for the best taste
                    </p>
                  </div>
                </div>
              </MobileCard>

              <MobileCard padding="md" shadow="sm" rounded="2xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-deep-green/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={24} className="text-deep-green" />
                  </div>
                  <div>
                    <h4 className="text-deep-green font-semibold mb-1">Low Glycemic Index</h4>
                    <p className="text-gray-600 text-sm">
                      Helps maintain stable blood sugar levels for better health
                    </p>
                  </div>
                </div>
              </MobileCard>

              <MobileCard padding="md" shadow="sm" rounded="2xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-maroon/10 flex items-center justify-center flex-shrink-0">
                    <Package size={24} className="text-maroon" />
                  </div>
                  <div>
                    <h4 className="text-deep-green font-semibold mb-1">Fast Delivery</h4>
                    <p className="text-gray-600 text-sm">
                      Free delivery on all orders with quick processing
                    </p>
                  </div>
                </div>
              </MobileCard>
            </div>
          </div>

          {/* Popular Products Teaser */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Join thousands of satisfied customers who trust Surya Rice
            </p>
            <Link
              to="/products"
              className="inline-flex items-center text-gold font-semibold hover:text-[#c99d4a] transition-colors"
            >
              Explore Our Collection
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-light pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:p-6 safe-area-top shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-deep-green">Shopping Cart</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-deep-green bg-beige px-3 py-1 rounded-full">
              {getTotalItems()} items
            </span>
            <button
              onClick={clearCart}
              className="text-maroon hover:text-red-600 active:text-red-700 text-sm font-semibold transition-colors touch-manipulation"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4 lg:space-y-6">
            {items.map((item) => (
              <div key={item.variantId} className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4 md:p-6 hover:shadow-soft-lg transition-shadow">
                <div className="flex items-start space-x-4 md:space-x-6">
                  {/* Product Image */}
                  <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                    <ProductImageCarousel
                      primaryImage={item.image}
                      aspectClassName="h-full w-full"
                      className="h-full w-full rounded-lg shadow-sm"
                      showControls={false}
                      showIndicators={false}
                      hoverPause={false}
                      altFallback={item.productName}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-deep-green mb-2 truncate text-base md:text-lg">
                      {item.productName}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 mb-4 font-medium">
                      Weight: <span className="font-semibold text-deep-green">{item.variantName}</span>
                    </p>
                    {/* Quantity Controls and Price Row */}
                    <div className="flex items-start justify-between gap-3">
                      {/* Quantity Controls */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center bg-white rounded-xl shadow-soft-sm overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item.variantId, item.quantity - 1, item.max_order_quantity)}
                            className="p-3 hover:bg-beige active:bg-beige transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4 text-deep-green" />
                          </button>
                          <span className="px-4 py-3 font-bold min-w-[3rem] text-center bg-beige text-deep-green">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.variantId, item.quantity + 1, item.max_order_quantity)}
                            disabled={item.max_order_quantity ? item.quantity >= item.max_order_quantity : false}
                            className="p-3 hover:bg-beige active:bg-beige transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4 text-deep-green" />
                          </button>
                        </div>
                        {item.max_order_quantity && (
                          <span className="text-xs text-gray-500 text-center">
                            Max {item.max_order_quantity}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg md:text-xl font-bold text-deep-green whitespace-nowrap">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500 font-medium">
                          ₹{item.price} each
                        </p>
                      </div>
                    </div>

                    {/* Remove Button - Separate Row */}
                    <div className="mt-3">
                      <button
                        onClick={() => removeFromCart(item.variantId)}
                        className="flex items-center gap-2 text-maroon hover:bg-red-50 active:bg-red-100 rounded-xl transition-colors px-3 py-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-5 md:p-6 lg:sticky lg:top-4">
              <h2 className="text-xl md:text-2xl font-bold text-deep-green mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600 text-base">
                  <span className="font-medium">Subtotal ({getTotalItems()} items)</span>
                  <span className="font-semibold">₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-base">
                  <span className="font-medium">Delivery Charges</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="border-t-2 border-gray-100 pt-4">
                  <div className="flex justify-between text-xl font-bold text-deep-green">
                    <span>Total</span>
                    <span className="text-deep-green">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-gold to-[#c99d4a] hover:shadow-gold-lg text-white py-5 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all active:scale-[0.98] shadow-gold touch-manipulation min-h-[56px] mb-6"
              >
                <span style={{ letterSpacing: '0.5px' }}>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link
                to="/products"
                className="block text-center text-gold hover:text-[#c99d4a] font-semibold transition-colors touch-manipulation py-2"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;