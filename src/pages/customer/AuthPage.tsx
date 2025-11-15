import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentLocation, getAddressFromCoords } from '../../services/api';
import { Sun, Phone, User, MapPin, Loader, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LocationData {
  city: string;
  principalSubdivision: string;
  postcode: string;
  locality: string;
}

const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!signupData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError('Password does not meet requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await signup({
        mobile_number: cleanPhone,
        password: password,
        ...signupData
      });
      
      if (success) {
        // After successful signup, try to login
        const loginSuccess = await login(cleanPhone, password);
        if (loginSuccess) {
          navigate('/');
        } else {
          setError('Account created successfully! Please login.');
          setMode('login');
        }
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (error) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-6 safe-area-top safe-area-bottom">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Sun className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Welcome to <span className="text-orange-400">SURYA</span>
          </h2>
          <p className="text-xl text-orange-200 font-medium">Premium Rice Delivery</p>
        </div>

        {/* Login Form */}
        {mode === 'login' && (
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white border-opacity-20">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-3">Login to Your Account</h3>
              <p className="text-orange-200 text-base">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-8">
              <div>
                <label htmlFor="phone" className="sr-only">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                    <Phone className="h-5 w-5 text-orange-300" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                    className="appearance-none rounded-xl relative block w-full pl-12 pr-4 py-5 border-2 border-orange-200 bg-white bg-opacity-20 placeholder-orange-200 text-white text-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all touch-manipulation"
                    placeholder="Enter your mobile number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                    <Lock className="h-5 w-5 text-orange-300" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full pl-12 pr-14 py-5 border-2 border-orange-200 bg-white bg-opacity-20 placeholder-orange-200 text-white text-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all touch-manipulation"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center touch-manipulation"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-orange-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-orange-300" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-200 text-base text-center bg-red-500 bg-opacity-30 rounded-xl p-4 border border-red-400 border-opacity-30">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg touch-manipulation min-h-[56px]"
              >
                {isLoading ? (
                  <Loader className="animate-spin h-5 w-5" />
                ) : (
                  'Login'
                )}
              </button>

              <div className="text-center">
                <p className="text-orange-200 text-base">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-orange-300 hover:text-orange-200 active:text-orange-100 font-bold underline transition-colors touch-manipulation"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white border-opacity-20">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-3">Create Your Account</h3>
              <p className="text-orange-200 text-base">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
              {/* Phone Number */}
              <div>
                <label className="block text-base font-semibold text-orange-200 mb-2">
                  Mobile Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                    <Phone className="h-5 w-5 text-orange-300" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                    className="appearance-none rounded-xl relative block w-full pl-12 pr-4 py-4 border-2 border-orange-200 bg-white bg-opacity-20 placeholder-orange-200 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all touch-manipulation"
                    placeholder="Enter your mobile number"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-base font-semibold text-orange-200 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                    <User className="h-5 w-5 text-orange-300" />
                  </div>
                  <input
                    type="text"
                    required
                    value={signupData.name}
                    onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                    className="appearance-none rounded-xl relative block w-full pl-12 pr-4 py-4 border-2 border-orange-200 bg-white bg-opacity-20 placeholder-orange-200 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all touch-manipulation"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-base font-semibold text-orange-200 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                    <Lock className="h-5 w-5 text-orange-300" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full pl-12 pr-14 py-4 border-2 border-orange-200 bg-white bg-opacity-20 placeholder-orange-200 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all touch-manipulation"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center touch-manipulation"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-orange-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-orange-300" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
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
                    <p className="text-sm text-orange-200 font-medium">
                      {getPasswordStrengthText(passwordValidation.strength)}
                    </p>
                    {!passwordValidation.isValid && (
                      <div className="text-sm text-red-200 mt-2 bg-red-500 bg-opacity-20 rounded-lg p-3">
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

              {/* Confirm Password */}
              <div>
                <label className="block text-base font-semibold text-orange-200 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                    <Lock className="h-5 w-5 text-orange-300" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full pl-12 pr-14 py-4 border-2 border-orange-200 bg-white bg-opacity-20 placeholder-orange-200 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all touch-manipulation"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center touch-manipulation"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-orange-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-orange-300" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-200 mt-2 bg-red-500 bg-opacity-20 rounded-lg p-2">Passwords do not match</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-base font-semibold text-orange-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                    <Mail className="h-5 w-5 text-orange-300" />
                  </div>
                  <input
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    className="appearance-none rounded-xl relative block w-full pl-12 pr-4 py-4 border-2 border-orange-200 bg-white bg-opacity-20 placeholder-orange-200 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all touch-manipulation"
                    placeholder="Enter your email (optional)"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-base font-semibold text-orange-200">
                    Delivery Address
                  </label>
                  <button
                    type="button"
                    onClick={getCurrentLocationData}
                    disabled={isLocationLoading}
                    className="flex items-center space-x-2 text-orange-300 hover:text-orange-200 active:text-orange-100 text-sm font-semibold transition-colors touch-manipulation bg-white bg-opacity-10 px-3 py-2 rounded-lg"
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
                  className="w-full px-4 py-4 border-2 border-orange-200 bg-white bg-opacity-20 placeholder-orange-200 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all touch-manipulation"
                  placeholder="House/Flat No., Street"
                />

                <input
                  type="text"
                  value={signupData.address_line2}
                  onChange={(e) => setSignupData(prev => ({ ...prev, address_line2: e.target.value }))}
                  className="w-full px-4 py-4 border-2 border-orange-200 bg-white bg-opacity-20 placeholder-orange-200 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all touch-manipulation"
                  placeholder="Area, Landmark (Optional)"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={signupData.city}
                    onChange={(e) => setSignupData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-4 border-2 border-orange-200 bg-white bg-opacity-20 placeholder-orange-200 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all touch-manipulation"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={signupData.state}
                    onChange={(e) => setSignupData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-4 py-4 border-2 border-orange-200 bg-white bg-opacity-20 placeholder-orange-200 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all touch-manipulation"
                    placeholder="State"
                  />
                </div>

                <input
                  type="text"
                  value={signupData.pincode}
                  onChange={(e) => setSignupData(prev => ({ ...prev, pincode: e.target.value }))}
                  className="w-full px-4 py-4 border-2 border-orange-200 bg-white bg-opacity-20 placeholder-orange-200 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all touch-manipulation"
                  placeholder="Pincode"
                />
              </div>

              {error && (
                <div className="text-red-200 text-base text-center bg-red-500 bg-opacity-30 rounded-xl p-4 border border-red-400 border-opacity-30">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !passwordValidation.isValid || password !== confirmPassword}
                className="w-full flex justify-center py-5 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg touch-manipulation min-h-[56px]"
              >
                {isLoading ? (
                  <Loader className="animate-spin h-5 w-5" />
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="text-center">
                <p className="text-orange-200 text-base">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-orange-300 hover:text-orange-200 active:text-orange-100 font-bold underline transition-colors touch-manipulation"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;