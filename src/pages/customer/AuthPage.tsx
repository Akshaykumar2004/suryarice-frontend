import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentLocation, getAddressFromCoords } from '../../services/api';
import { Sun, User, MapPin, Loader, Mail, Lock, Eye, EyeOff, ArrowLeft, Phone } from 'lucide-react';
import PhoneVerification from '../../components/auth/PhoneVerification';
import { api } from '../../services/api';

interface LocationData {
  city: string;
  principalSubdivision: string;
  postcode: string;
  locality: string;
}

const AuthPage = () => {
  type AuthMode = 'login' | 'signup';
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Signup form fields
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  const { login, signup, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3').substr(0, 12);
    }
    return value;
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push(`At least ${minLength} characters`);
    if (!hasUpperCase) errors.push('One uppercase letter');
    if (!hasLowerCase) errors.push('One lowercase letter');
    if (!hasNumbers) errors.push('One number');
    if (!hasSpecialChar) errors.push('One special character');

    return {
      isValid: errors.length === 0,
      errors,
      strength: password.length === 0 ? 0 : Math.min(5 - errors.length, 4)
    };
  };

  const getPasswordStrengthColor = (strength: number) => {
    switch (strength) {
      case 0: return 'bg-gray-300';
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0: return '';
      case 1: return 'Very Weak';
      case 2: return 'Weak';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await login(cleanPhone, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid phone number or password. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(`Password must contain: ${passwordValidation.errors.join(', ')}`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Start phone verification for signup using Twilio
      const response = await api.post('/auth/phone/start-verification/', {
        phone_number: `+91${cleanPhone}`
      });

      if (response.data.success) {
        setShowPhoneVerification(true);
        setIsVerifying(true);
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to start phone verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = async () => {
    // Complete the signup process after verification
    setIsLoading(true);
    setError('');

    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const userData = {
        mobile_number: `+91${cleanPhone}`,
        password: password,
        name: signupData.name,
        email: signupData.email || undefined,
        address_line1: signupData.address_line1 || undefined,
        address_line2: signupData.address_line2 || undefined,
        city: signupData.city || undefined,
        state: signupData.state || undefined,
        pincode: signupData.pincode || undefined,
        landmark: signupData.landmark || undefined,
        is_phone_verified: true
      };

      const success = await signup(userData);
      
      if (success) {
        // Auto-login after successful signup
        const loginSuccess = await login(cleanPhone, password);
        if (loginSuccess) {
          navigate('/');
        } else {
          // If auto-login fails, redirect to login page
          setMode('login');
          setError('Registration successful! Please login with your credentials.');
          setShowPhoneVerification(false);
        }
      } else {
        setError('Failed to complete signup. Please try again.');
        setShowPhoneVerification(false);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred during signup');
      setShowPhoneVerification(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromVerification = () => {
    setShowPhoneVerification(false);
    setIsVerifying(false);
  };

  const getCurrentLocationData = async () => {
    setIsLocationLoading(true);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      const locationData: LocationData = await getAddressFromCoords(latitude, longitude);
      
      setSignupData(prev => ({
        ...prev,
        city: locationData.city || locationData.locality || prev.city,
        state: locationData.principalSubdivision || prev.state,
        pincode: locationData.postcode || prev.pincode
      }));
      
    } catch (error) {
      console.error('Location error:', error);
      setError('Could not get your location. Please enter address manually.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const passwordValidation = validatePassword(password);

  if (showPhoneVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <PhoneVerification
          phoneNumber={`+91${phoneNumber.replace(/\D/g, '')}`}
          onVerificationComplete={handleVerificationComplete}
          onBack={handleBackFromVerification}
          isNewUser={mode === 'signup'}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="p-8">
            {isVerifying && (
              <button
                onClick={handleBackFromVerification}
                className="flex items-center text-gray-700 hover:text-gray-900 transition-colors mb-6"
              >
                <ArrowLeft className="w-5 h-5 mr-1" /> Back
              </button>
            )}
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 p-3">
                <img 
                  src="/logo-removebg-preview.png" 
                  alt="Surya Rice Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-gray-600">
                {mode === 'login' 
                  ? 'Sign in to your account to continue' 
                  : 'Fill in your details to create an account'}
              </p>
            </div>

            <form 
              onSubmit={mode === 'login' ? handleLogin : handleStartVerification} 
              className="space-y-6"
            >
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                    className="appearance-none rounded-xl relative block w-full pl-12 pr-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="123-456-7890"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full pl-12 pr-14 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={mode === 'login' ? "Enter your password" : "Create a strong password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator for Signup */}
                {mode === 'signup' && password && (
                  <div className="mt-3">
                    <div className="flex space-x-1 mb-2">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded-full ${
                            level <= passwordValidation.strength
                              ? getPasswordStrengthColor(passwordValidation.strength)
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      {getPasswordStrengthText(passwordValidation.strength)}
                    </p>
                    {!passwordValidation.isValid && (
                      <div className="text-sm text-red-600 mt-2 bg-red-50 rounded-lg p-3 border border-red-200">
                        <p className="font-semibold mb-1">Password must have:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {passwordValidation.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {mode === 'signup' && (
                <>
                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="appearance-none rounded-xl relative block w-full pl-12 pr-14 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-sm text-red-600 mt-2 bg-red-50 rounded-lg p-2 border border-red-200">
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={signupData.name}
                        onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                        className="appearance-none rounded-xl relative block w-full pl-12 pr-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                        className="appearance-none rounded-xl relative block w-full pl-12 pr-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Delivery Address (Optional)
                      </label>
                      <button
                        type="button"
                        onClick={getCurrentLocationData}
                        disabled={isLocationLoading}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
                      >
                        {isLocationLoading ? (
                          <Loader className="animate-spin h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        <span>{isLocationLoading ? 'Getting...' : 'Use Location'}</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={signupData.address_line1}
                      onChange={(e) => setSignupData(prev => ({ ...prev, address_line1: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="House/Flat No., Street"
                    />

                    <input
                      type="text"
                      value={signupData.address_line2}
                      onChange={(e) => setSignupData(prev => ({ ...prev, address_line2: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Area, Landmark"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={signupData.city}
                        onChange={(e) => setSignupData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        value={signupData.state}
                        onChange={(e) => setSignupData(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="State"
                      />
                    </div>

                    <input
                      type="text"
                      value={signupData.pincode}
                      onChange={(e) => setSignupData(prev => ({ ...prev, pincode: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Pincode"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="text-red-700 text-sm text-center bg-red-100 rounded-lg p-3 border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || (mode === 'signup' && (!passwordValidation.isValid || password !== confirmPassword))}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading && <Loader className="animate-spin h-5 w-5 mr-2" />}
                {mode === "login" ? 'Sign In' : 'Create Account'}
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-center text-gray-600">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'login' ? 'signup' : 'login');
                      setError('');
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;