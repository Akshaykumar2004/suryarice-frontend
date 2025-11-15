import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sun, Shield, Loader } from 'lucide-react';

const AdminLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.is_staff) {
      navigate('/secret/admin');
    }
  }, [user, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
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
      const success = await login(cleanPhone, password, "yes");
      console.log(success);
      if (success) {
        
        // Navigate immediately after successful login
        navigate('/secret/admin');
      } else if (success && !user?.is_staff) {
        setError('Access denied. Admin privileges required.');
        logout();
      } else {
        setError('Invalid credentials or insufficient privileges.');
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            <span className="text-orange-400">SURYA</span> Admin
          </h2>
          <p className="mt-2 text-gray-400">Secure Admin Access</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label htmlFor="admin-mobile" className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Mobile Number
                </label>
                <input
                  id="admin-mobile"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="appearance-none rounded-xl relative block w-full px-4 py-4 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your admin mobile number"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-4 py-4 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter admin password"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-900 bg-opacity-20 rounded-lg p-3 border border-red-800">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader className="animate-spin h-5 w-5" />
                ) : (
                  'Login'
                )}
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;