import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, LogOut, LayoutDashboard, Package, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext'; // Import Context

// UPDATED: Points to local backend or your future GearUp deployment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 
const BRAND_COLOR = '#2563EB'; 

const Navbar = ({ user, onLogout }) => { // Removed cartCount prop
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // --- FIX: Get Cart Data Directly from Context ---
  const { cart } = useCart();
  const cartCount = cart ? cart.reduce((acc, item) => acc + item.qty, 0) : 0;
  // -----------------------------------------------

  const handleSearch = (e) => {
    e.preventDefault(); 
    if (searchQuery.trim()) {
      navigate('/shop'); 
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      // Optional: Backend logout call if you implement it later
      // await fetch(`${API_URL}/auth/logout`, ...);
    } catch (error) {
      console.error("Logout error", error);
    }
    onLogout(); 
    toast.success("Logged out.");
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 transition-all duration-300">
      
      {/* Announcement Bar */}
      <div className="bg-black text-white text-[10px] md:text-xs py-1.5 px-4 flex justify-center items-center tracking-wide">
        <span className="font-medium text-center truncate">Free Shipping on All Orders Above ₹499 | Use Code: NEWGEAR10</span>
      </div>

      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-1 text-gray-800">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* --- LOGO --- */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
           <h1 className="text-logo">
             Gear <span>UP</span>
           </h1>
           <Bell className="w-6 h-6 text-blue-600 -mt-2 -rotate-12" fill="currentColor" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-700"> 
          <Link to="/" className="hover:text-blue-600 transition relative group">Home</Link>
          <Link to="/shop" className="hover:text-blue-600 transition relative group">Shop Now</Link>
          <Link to="/shop" className="hover:text-blue-600 transition relative group">New Arrivals</Link>
          
          {user && (
             <Link to="/account" className="hover:text-blue-600 transition relative group flex items-center gap-1 text-blue-600 font-bold">
                My Orders
             </Link>
          )}

          {user && user.isAdmin && (
             <Link to="/admin" className="text-red-600 font-bold flex items-center gap-1 hover:text-red-700 transition">
                <LayoutDashboard size={16} /> Admin Panel
             </Link>
          )}
        </div>

        {/* Icons Section */}
        <div className="flex gap-4 md:gap-5 text-gray-600 items-center">
          <div className="relative flex items-center">
            {showSearch && (
              <form onSubmit={handleSearch} className="absolute right-0 top-10 md:top-auto md:right-8 z-50">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-40 md:w-48 focus:outline-none focus:border-blue-500 bg-white shadow-lg"
                  autoFocus
                />
              </form>
            )}
            <Search className="w-5 h-5 cursor-pointer hover:text-blue-600 transition" onClick={() => setShowSearch(!showSearch)} />
          </div>

          {user ? (
            <div className="flex items-center gap-3 pl-3 ml-1 border-l border-gray-200">
                <Link to="/account" className="text-xs font-bold hidden md:block text-blue-600 truncate max-w-[80px] hover:underline">
                  Hi, {user.name ? user.name.split(' ')[0] : 'User'}
                </Link>
                <button onClick={handleLogout} title="Logout">
                  <LogOut className="w-5 h-5 cursor-pointer text-gray-400 hover:text-red-500 transition" />
                </button>
            </div>
          ) : (
            <Link to="/login" title="Login">
                <User className="w-5 h-5 cursor-pointer hover:text-blue-600 transition" />
            </Link>
          )}

          <Link to="/cart" className="relative group">
            <ShoppingBag className="w-5 h-5 cursor-pointer hover:text-blue-600 transition" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm" style={{backgroundColor: BRAND_COLOR}}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 p-4 flex flex-col gap-3 text-sm font-medium shadow-xl absolute w-full left-0 z-50 animate-in slide-in-from-top-2">
          <Link to="/" onClick={() => setIsOpen(false)} className="py-2 border-b border-gray-50">Home</Link>
          <Link to="/shop" onClick={() => setIsOpen(false)} className="py-2 border-b border-gray-50">Shop Now</Link>
          <Link to="/shop" onClick={() => setIsOpen(false)} className="py-2 border-b border-gray-50">New Arrivals</Link>
          {user && <Link to="/account" onClick={() => setIsOpen(false)} className="py-2 border-b border-gray-50 text-blue-600 font-bold flex items-center gap-2"><Package size={18} /> My Orders</Link>}
          {user && user.isAdmin && <Link to="/admin" onClick={() => setIsOpen(false)} className="py-2 border-b border-gray-50 text-red-600 font-bold flex gap-2 items-center"><LayoutDashboard size={18}/> Admin Panel</Link>}
          {user ? (
             <div className="flex justify-between items-center py-2 mt-2 bg-gray-50 px-3 rounded-lg">
                <span className="font-bold text-gray-700">Hi, {user.name}</span>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-red-500 font-bold text-xs uppercase tracking-wider">Logout</button>
             </div>
          ) : (
             <Link to="/login" onClick={() => setIsOpen(false)} className="py-2 text-blue-600 font-bold">Login / Register</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;