import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { api, getCurrentLocation, getAddressFromCoords } from '../../services/api';
import { MapPin, Loader, CreditCard, Truck } from 'lucide-react';
import ProductImageCarousel from '../../components/ProductImageCarousel';

interface DeliveryAddress {
  name: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

const CheckoutPage = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    name: user?.name || '',
    mobile: user?.mobile_number || '',
    addressLine1: user?.address_line1 || '',
    addressLine2: user?.address_line2 || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    landmark: user?.landmark || ''
  });

  const [notes, setNotes] = useState('');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errors, setErrors] = useState<Partial<DeliveryAddress>>({});

  const getCurrentLocationData = async () => {
    setIsLocationLoading(true);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      const locationData = await getAddressFromCoords(latitude, longitude);
      
      setDeliveryAddress(prev => ({
        ...prev,
        city: locationData.city || locationData.locality || prev.city,
        state: locationData.principalSubdivision || prev.state,
        pincode: locationData.postcode || prev.pincode
      }));
      
    } catch (error) {
      console.error('Location error:', error);
      alert('Could not get your location. Please enter address manually.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DeliveryAddress> = {};

    if (!deliveryAddress.name.trim()) newErrors.name = 'Name is required';
    if (!deliveryAddress.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!deliveryAddress.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!deliveryAddress.city.trim()) newErrors.city = 'City is required';
    if (!deliveryAddress.state.trim()) newErrors.state = 'State is required';
    if (!deliveryAddress.pincode.trim()) newErrors.pincode = 'Pincode is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsPlacingOrder(true);
    
    try {
      const orderData = {
        delivery_name: deliveryAddress.name,
        delivery_mobile: deliveryAddress.mobile,
        delivery_address_line1: deliveryAddress.addressLine1,
        delivery_address_line2: deliveryAddress.addressLine2,
        delivery_city: deliveryAddress.city,
        delivery_state: deliveryAddress.state,
        delivery_pincode: deliveryAddress.pincode,
        delivery_landmark: deliveryAddress.landmark,
        notes: notes,
        items: items.map(item => ({
          product_variant: item.variantId,
          quantity: item.quantity
        }))
      };

      const response = await api.post('/orders/', orderData);
      
      // Clear cart and redirect to success page
      clearCart();
      navigate(`/orders/${response.data.id}`, { 
        state: { orderPlaced: true } 
      });
      
    } catch (error: any) {
      console.error('Order placement error:', error);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:p-6 safe-area-top shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Checkout</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Delivery Details */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">Delivery Address</h2>
                <button
                  onClick={getCurrentLocationData}
                  disabled={isLocationLoading}
                  className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 active:text-orange-700 font-semibold text-sm md:text-base transition-colors touch-manipulation"
                >
                  {isLocationLoading ? (
                    <Loader className="animate-spin h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                  <span>{isLocationLoading ? 'Getting Location...' : 'Use Current Location'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.name}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={deliveryAddress.mobile}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, mobile: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base ${
                      errors.mobile ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter mobile number"
                  />
                  {errors.mobile && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.mobile}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.addressLine1}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base ${
                      errors.addressLine1 ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="House/Flat No., Street Name"
                  />
                  {errors.addressLine1 && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.addressLine1}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.addressLine2}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base bg-white"
                    placeholder="Area, Landmark (Optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base ${
                      errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter city"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.state}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base ${
                      errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter state"
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.pincode}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, pincode: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base ${
                      errors.pincode ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter pincode"
                  />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.pincode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.landmark}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, landmark: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base bg-white"
                    placeholder="Nearby landmark (Optional)"
                  />
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Order Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base bg-white resize-none"
                placeholder="Any special instructions for delivery (Optional)"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
              <div className="flex items-center space-x-3 p-4 md:p-5 border-2 border-orange-500 bg-orange-50 rounded-xl">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-orange-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-gray-800 text-base md:text-lg">Cash on Delivery</p>
                  <p className="text-sm text-gray-600">Pay when your order arrives</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 md:p-6 lg:sticky lg:top-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                {items.map((item) => (
                  <div key={item.variantId} className="flex items-center space-x-3 md:space-x-4 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
                      <ProductImageCarousel
                        primaryImage={item.image}
                        aspectClassName="h-full w-full"
                        className="h-full w-full rounded-lg"
                        showControls={false}
                        showIndicators={false}
                        hoverPause={false}
                        altFallback={item.productName}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate text-sm md:text-base">{item.productName}</p>
                      <p className="text-xs md:text-sm text-gray-600">{item.variantName} × {item.quantity}</p>
                    </div>
                    <p className="font-bold text-orange-500 text-sm md:text-base">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600 text-sm md:text-base">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm md:text-base">
                  <span className="font-medium">Delivery Charges</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-lg md:text-xl font-bold text-gray-800 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-orange-500">₹{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Truck className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span>Expected delivery: 5-7 business days</span>
                </div>
                
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg touch-manipulation min-h-[56px] disabled:shadow-none"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader className="animate-spin h-5 w-5" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <span className="ml-2">₹{getTotalPrice().toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;