import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, Minus, Plus, Tag } from 'lucide-react';
import toast from 'react-hot-toast'; 
import apiClient from '../api/apiClient'; 
import confetti from 'canvas-confetti'; 
import { useCart } from '../context/CartContext'; // Import Hook

const Cart = () => {
  const navigate = useNavigate();
  // Use Context instead of props
  const { cart, removeFromCart, updateCartQuantity, discount, setDiscount, cartTotal, finalTotal } = useCart();
  const [promoCode, setPromoCode] = useState('');

  const triggerConfetti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) return;
    try {
        const res = await apiClient.post('/coupons/verify', { code: promoCode });
        const { discountPercentage } = res.data;
        const discountAmount = Math.round(cartTotal * (discountPercentage / 100));
        setDiscount(discountAmount);
        triggerConfetti();
        toast.success(`Coupon Applied! ${discountPercentage}% OFF`);
    } catch (error) {
        toast.error(error.response?.data?.message || "Invalid Coupon Code");
        setDiscount(0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl">
            <p className="text-gray-500 mb-6 text-lg">Your cart is currently empty.</p>
            <button onClick={() => navigate('/shop')} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition">
                Start Shopping
            </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="md:col-span-2 space-y-4">
                {cart.map((item) => (
                    <div key={item._id} className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className={`w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden ${item.imageColor || 'bg-gray-100'}`}>
                                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                                <p className="text-sm text-gray-500">Rs. {item.price}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button onClick={() => updateCartQuantity(item._id, item.quantity - 1)} className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 border-r"><Minus size={18} /></button>
                                <span className="px-4 font-semibold text-gray-800">{item.quantity}</span>
                                <button onClick={() => updateCartQuantity(item._id, item.quantity + 1)} className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 border-l"><Plus size={18} /></button>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-gray-900 min-w-[80px] text-right">Rs. {item.price * item.quantity}</span>
                                <button onClick={() => removeFromCart(item._id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50"><Trash2 size={20} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Order Summary */}
            <div className="bg-gray-50 p-6 rounded-xl h-fit sticky top-24">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Order Summary</h3>
                <div className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Tag size={16} className="text-gray-400" /></div>
                        <input type="text" placeholder="Promo Code" className="w-full pl-9 pr-3 py-3 border rounded-lg text-sm uppercase focus:outline-none focus:border-blue-600" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                    </div>
                    <button onClick={handleApplyCoupon} className="bg-black text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition">Apply</button>
                </div>

                <div className="space-y-3 mb-6 text-sm text-gray-600">
                    <div className="flex justify-between"><span>Subtotal</span><span>Rs. {cartTotal}</span></div>
                    {discount > 0 && (
                        <div className="flex justify-between text-blue-600 font-bold bg-blue-50 p-2 rounded">
                            <span>Discount</span><span>- Rs. {discount}</span>
                        </div>
                    )}
                    <div className="flex justify-between"><span>Shipping</span><span className="text-green-600 font-medium">Free</span></div>
                </div>

                <div className="flex justify-between mb-6 font-bold text-lg border-t border-gray-200 pt-4 text-gray-900">
                    <span>Total</span><span>Rs. {finalTotal > 0 ? finalTotal : 0}</span>
                </div>
                <button onClick={() => navigate('/checkout')} disabled={cart.length === 0} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-lg">
                    Proceed to Checkout <ArrowRight size={20}/>
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
export default Cart;