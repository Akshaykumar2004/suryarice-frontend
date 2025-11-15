import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentLocation, getAddressFromCoords } from '../../services/api';
import { User, Phone, MapPin, Edit3, Save, X, Loader } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address_line1: user?.address_line1 || '',
    address_line2: user?.address_line2 || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    landmark: user?.landmark || ''
  });

  const getCurrentLocationData = async () => {
    setIsLocationLoading(true);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      const locationData = await getAddressFromCoords(latitude, longitude);
      
      setFormData(prev => ({
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateProfile(formData);
      if (success) {
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      address_line1: user?.address_line1 || '',
      address_line2: user?.address_line2 || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
      landmark: user?.landmark || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white p-4 md:p-6 safe-area-top shadow-md">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
            <p className="text-teal-200">{user?.mobile_number}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 border-b border-gray-200 gap-3">
            <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 font-medium"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader className="animate-spin w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base bg-white"
                  />
                ) : (
                  <p className="text-gray-800 py-2 text-base">{user?.name || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="flex items-center space-x-2 py-2">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
                  <p className="text-gray-800 text-base">{user?.mobile_number}</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base bg-white"
                    placeholder="Enter your email address"
                  />
                ) : (
                  <p className="text-gray-800 py-2 text-base">{user?.email || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 border-b border-gray-200 gap-3">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">Delivery Address</h2>
            {isEditing && (
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
            )}
          </div>

          <div className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 1
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address_line1}
                    onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base bg-white"
                    placeholder="House/Flat No., Street Name"
                  />
                ) : (
                  <p className="text-gray-800 py-2 text-base">{user?.address_line1 || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 2
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address_line2}
                    onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base bg-white"
                    placeholder="Area, Landmark (Optional)"
                  />
                ) : (
                  <p className="text-gray-800 py-2 text-base">{user?.address_line2 || 'Not provided'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base bg-white"
                      placeholder="Enter city"
                    />
                  ) : (
                    <p className="text-gray-800 py-2 text-base">{user?.city || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base bg-white"
                      placeholder="Enter state"
                    />
                  ) : (
                    <p className="text-gray-800 py-2 text-base">{user?.state || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base bg-white"
                      placeholder="Enter pincode"
                    />
                  ) : (
                    <p className="text-gray-800 py-2 text-base">{user?.pincode || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Landmark
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base bg-white"
                    placeholder="Nearby landmark (Optional)"
                  />
                ) : (
                  <p className="text-gray-800 py-2 text-base">{user?.landmark || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 overflow-hidden">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Account Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors touch-manipulation min-h-[44px] font-medium">
              Order History
            </button>
            <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors touch-manipulation min-h-[44px] font-medium">
              Help & Support
            </button>
            <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors touch-manipulation min-h-[44px] font-medium">
              Privacy Policy
            </button>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl transition-colors font-bold touch-manipulation min-h-[44px]"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;