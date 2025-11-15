import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  mobile_number: string;
  name: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  is_verified: boolean;
  is_staff: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (mobile: string, password?: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => void;
  verifyOTP: (mobile: string, otp: string) => Promise<boolean>;
  resendOTP: (mobile: string) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
}

interface SignupData {
  mobile_number: string;
  name: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user_data');
      
      if (token && storedUser) {
        // Try to use stored user data first
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Verify token is still valid by making a request
        try {
          const response = await api.get('/users/me/');
          const freshUserData = response.data;
          setUser(freshUserData);
          localStorage.setItem('user_data', JSON.stringify(freshUserData));
        } catch (error) {
          // Token might be expired, clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      const response = await api.post('/auth/register/', userData);
      
      if (response.status === 201 || response.status === 200) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    }
  };

  const verifyOTP = async (mobile: string, otp: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/verify-otp/', {
        mobile_number: mobile,
        otp: otp
      });

      const { access, refresh, user: userData } = response.data;
      
      // Store tokens and user data in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      setUser(userData);
      return true;
    } catch (error) {
      console.error('OTP verification failed:', error);
      return false;
    }
  };

  const login = async (mobile: string, password?: string, is_admin?: string): Promise<boolean> => {
    try {
      // Check if this is an admin login (has password) or regular user login
      const endpoint = is_admin ? '/auth/admin-login/' : '/auth/login/';
      const payload = password ? {
        mobile_number: mobile,
        password: password
      } : {
        mobile_number: mobile
      };
      
      const response = await api.post(endpoint, payload);

      // For admin login, if we get a 200 response, the user is an admin
      if (password && response.status === 200) {
        const { access, refresh, user: userData } = response.data;
        
        // Store tokens and user data in localStorage
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        setUser(userData);
        return true;
      }
      
      // For regular login (OTP-based)
      if (!password) {
        // This will trigger OTP sending, return true to proceed to OTP verification
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const resendOTP = async (mobile: string): Promise<boolean> => {
    try {
      await api.post('/auth/resend-otp/', { mobile_number: mobile });
      return true;
    } catch (error) {
      console.error('Resend OTP failed:', error);
      return false;
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      // Use the update_profile action endpoint
      const response = await api.put('/users/update_profile/', userData);
      const updatedUser = response.data;
      
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      logout,
      verifyOTP,
      resendOTP,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};