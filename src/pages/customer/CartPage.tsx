import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import ProductImageCarousel from '../../components/ProductImageCarousel';

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, getTotalItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (variantId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(variantId);
    } else {
      updateQuantity(variantId, newQuantity);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20 md:pb-0 px-6">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <ShoppingBag className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Looks like you haven't added any rice varieties to your cart yet. 
            Explore our premium collection and find your perfect match!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-8 py-4 rounded-full font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg touch-manipulation min-h-[56px]"
          >
            Start Shopping <ArrowRight className="ml-3 w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:p-6 safe-area-top shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {getTotalItems()} items
            </span>
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-600 active:text-red-700 text-sm font-semibold transition-colors touch-manipulation"
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
              <div key={item.variantId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
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
                    <h3 className="font-bold text-gray-800 mb-2 truncate text-base md:text-lg">
                      {item.productName}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 mb-4 font-medium">
                      Weight: <span className="font-semibold">{item.variantName}</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                          <button
                            onClick={() => handleQuantityChange(item.variantId, item.quantity - 1)}
                            className="p-3 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-3 font-bold min-w-[3rem] text-center bg-gray-50">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.variantId, item.quantity + 1)}
                            className="p-3 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="p-3 text-red-500 hover:bg-red-50 active:bg-red-100 rounded-xl transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg md:text-xl font-bold text-orange-500">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 font-medium">
                          ₹{item.price} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 md:p-6 lg:sticky lg:top-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
              
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
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-orange-500">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg touch-manipulation min-h-[56px] mb-6"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link
                to="/products"
                className="block text-center text-orange-500 hover:text-orange-600 active:text-orange-700 font-semibold transition-colors touch-manipulation py-2"
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