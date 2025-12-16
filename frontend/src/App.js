import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import Home from './pages/Home';
import Shop from './pages/Shop';
// import Story from './pages/Story';
import Ingredients from './pages/Ingredients';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword'; 
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import BlogDetail from './pages/BlogDetail';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile'; 
import ProductDetails from './pages/ProductDetails'; 
import toast from 'react-hot-toast'; 

function App() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [discount, setDiscount] = useState(0); 

  // --- FIX: Safer Local Storage Loading ---
  // This prevents the "undefined is not valid JSON" crash
  useEffect(() => {
    // Safer User Loading
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        try {
            setUser(JSON.parse(storedUser));
        } catch (error) {
            console.error("Corrupt user data found, clearing...", error);
            localStorage.removeItem('user');
        }
    }

    // Safer Cart Loading
    const storedCart = localStorage.getItem('cart');
    if (storedCart && storedCart !== "undefined" && storedCart !== "null") {
        try {
            setCart(JSON.parse(storedCart));
        } catch (error) {
             console.error("Corrupt cart data found, clearing...", error);
             localStorage.removeItem('cart');
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (cart.length === 0) setDiscount(0); 
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item._id === product._id);
      if (existingItem) {
        toast.success(`Added another ${product.name}!`);
        return prevCart.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        toast.success(`${product.name} added to cart!`);
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateCartQuantity = (productId, newQuantity) => {
    setCart((prevCart) => {
      if (newQuantity <= 0) return prevCart.filter(item => item._id !== productId);
      return prevCart.map(item =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
    toast.error("Item removed from cart.");
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCurrentOrder(null);
    localStorage.removeItem('cart');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token'); 
  };

  const initCheckout = (addressDetails) => {
    const orderId = 'ORD-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalTotal = subtotal - discount;

    const orderData = {
        id: orderId,
        items: cart,
        total: finalTotal > 0 ? finalTotal : 0,
        discountApplied: discount,
        details: addressDetails,
        userId: user ? user.id : 'guest', 
        date: new Date().toLocaleDateString()
    };
    setCurrentOrder(orderData);
    return orderData;
  };

  return (
    <Router>
      <div className="font-sans antialiased text-gray-900 bg-white min-h-screen flex flex-col">
        <Navbar cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} user={user} onLogout={handleLogout} /> 
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route path="/shop" element={<Shop addToCart={addToCart} />} />
            <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />
            
            {/* <Route path="/story" element={<Story />} /> */}
            <Route path="/ingredients" element={<Ingredients />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            <Route path="/cart" element={<Cart cartItems={cart} updateQuantity={updateCartQuantity} removeFromCart={removeFromCart} discount={discount} setDiscount={setDiscount} />} />
            <Route path="/checkout" element={<Checkout cart={cart} initCheckout={initCheckout} />} />
            <Route path="/payment" element={<Payment order={currentOrder} clearCart={clearCart} user={user} />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/account" element={<UserProfile user={user} />} /> 
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;