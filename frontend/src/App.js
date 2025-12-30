import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Payment from './pages/Payment';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import Ingredients from './pages/Ingredients';
import BlogDetail from './pages/BlogDetail';
import ForgotPassword from './pages/ForgotPassword';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

function App() {
  const [user, setUser] = useState(null);

  // --- FIX: Restore User from LocalStorage on App Load ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);
  // -------------------------------------------------------

  // Login Handler
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Ensure it's saved
    // Token is usually saved in Login.jsx, but good to double check
  };

  // Logout Handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/'; // Hard refresh to clear any stale state
  };

  return (
    <CartProvider>
      <Router basename="/GearUP">
        <Toaster position="top-center" />
        <div className="flex flex-col min-h-screen">
          <Navbar user={user} onLogout={handleLogout} />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/ingredients" element={<Ingredients />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              
              <Route path="/login" element={
                !user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />
              } />
              
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route path="/checkout" element={
                user ? <Checkout user={user} /> : <Navigate to="/login" />
              } />

              <Route path="/payment" element={
                user ? <Payment /> : <Navigate to="/login" />
              } />
              
              <Route path="/profile" element={
                user ? <UserProfile user={user} /> : <Navigate to="/login" />
              } />

              {/* Admin Route Protection */}
              <Route path="/admin" element={
                user && user.isAdmin ? <AdminDashboard /> : <Navigate to="/" />
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;