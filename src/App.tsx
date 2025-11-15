import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Customer Components
import CustomerLayout from './components/layout/CustomerLayout';
import HomePage from './pages/customer/HomePage';
import AuthPage from './pages/customer/AuthPage';
import ProductsPage from './pages/customer/ProductsPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import ProfilePage from './pages/customer/ProfilePage';

// Admin Components
import AdminLayout from './components/layout/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductImages from './pages/admin/AdminProductImages';
import AdminUsers from './pages/admin/AdminUsers';
import AdminInventory from './pages/admin/AdminInventory';
import AdminProductVariants from './pages/admin/AdminProductVariants';
import AdminCategories from './pages/admin/AdminCategories';
import AdminReviews from './pages/admin/AdminReviews';
import AdminFeedbacks from './pages/admin/AdminFeedbacks';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminNotifications from './pages/admin/AdminNotifications';

// Protected Route Components
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-teal-800 to-teal-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-400 border-t-transparent"></div>
    </div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-400 border-t-transparent"></div>
    </div>;
  }
  
  // If user exists and came through admin login, they are authorized
  return user ? <>{children}</> : <Navigate to="/secret/admin/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<CustomerLayout />}>
                <Route index element={<HomePage />} />
                <Route path="auth" element={<AuthPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route path="cart" element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                } />
                <Route path="checkout" element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } />
                <Route path="orders" element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="orders/:id" element={
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Admin Routes */}
              <Route path="/secret/admin/login" element={<AdminLogin />} />
              <Route path="/secret/admin" element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="product-images" element={<AdminProductImages />} />
                <Route path="product-variants" element={<AdminProductVariants />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="feedback" element={<AdminFeedbacks />} />
                <Route path="suppliers" element={<AdminSuppliers />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="inventory" element={<AdminInventory />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;