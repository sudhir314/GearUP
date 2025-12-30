import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import apiClient from '../api/apiClient'; 
import qrCodeImg from '../assets/payment-qr.jpg'; 
import { Package, Truck, CheckCircle, AlertTriangle, ServerCrash, Wallet } from 'lucide-react';
import { useCart } from '../context/CartContext'; 

// Success Animation
const OrderSuccessAnimation = ({ onComplete }) => {
    const [stage, setStage] = useState(0); 
    useEffect(() => {
        const timer1 = setTimeout(() => setStage(1), 1500);
        const timer2 = setTimeout(() => setStage(2), 4000);
        const timer3 = setTimeout(onComplete, 5500);
        return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
    }, [onComplete]);
    return ( 
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center"> 
            <div className="text-center"> 
                {stage === 0 && (<div className="animate-in fade-in zoom-in duration-500"> <Package size={80} className="text-orange-500 animate-bounce" /> <h2 className="text-2xl font-bold text-gray-800">Packing your order...</h2> </div>)} 
                {stage === 1 && (<div className="animate-in fade-in slide-in-from-right duration-700"> <Truck size={80} className="text-blue-600" /> <h2 className="text-2xl font-bold text-gray-800">On its way!</h2> </div>)} 
                {stage === 2 && (<div className="animate-in zoom-in duration-500"> <CheckCircle size={80} className="text-green-600" /> <h2 className="text-3xl font-bold text-gray-900">Order Confirmed!</h2> </div>)} 
            </div> 
        </div> 
    );
};

const Payment = ({ user }) => {
  const { cart, finalTotal, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [method, setMethod] = useState('scan'); 
  const [isProcessing, setIsProcessing] = useState(false); 

  const shippingAddress = location.state?.shippingAddress;

  useEffect(() => {
    if (!shippingAddress || !cart || cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, shippingAddress, navigate]);

  if (!cart || cart.length === 0 || !shippingAddress) return null;

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to finalize your order.");
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    // Determine Backend Payment Method String
    let paymentMethodString = 'Online';
    if (method === 'cod') paymentMethodString = 'COD';
    else if (method === 'scan') paymentMethodString = 'UPI QR';

    try {
        const orderData = {
            items: cart.map(item => ({
                product: item._id, 
                quantity: item.quantity
            })),
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethodString // Sending COD or Online
        };
        
        const res = await apiClient.post('/orders', orderData);
        if (res.status >= 400) throw new Error(res.data.message);
        
        // Animation handles redirection
    } catch (error) {
        console.error("Order Error:", error);
        setIsProcessing(false);
        toast.error("Order failed. Please try again.");
    }
  };

  const handleAnimationComplete = () => {
      clearCart(); 
      navigate('/profile');
      toast.success("Order placed successfully!");
  };

  return (
    <>
      {isProcessing && <OrderSuccessAnimation onComplete={handleAnimationComplete} />}
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center items-center">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Checkout</h2>
          <div className="mb-6 text-center">
              <p className="text-gray-500">Total Amount to Pay</p>
              <p className="text-3xl font-bold text-green-600">₹{finalTotal}</p>
          </div>

           {/* --- UPDATED BUTTONS --- */}
           <div className="grid grid-cols-2 gap-2 mb-6">
              <button onClick={() => setMethod('scan')} className={`py-2 rounded-lg border text-sm font-medium transition ${method === 'scan' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Scan QR</button>
              <button onClick={() => setMethod('cod')} className={`py-2 rounded-lg border text-sm font-medium transition ${method === 'cod' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Cash On Delivery</button>
              <button onClick={() => setMethod('card')} className={`py-2 rounded-lg border text-sm font-medium transition ${method === 'card' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Card</button>
              <button onClick={() => setMethod('upi')} className={`py-2 rounded-lg border text-sm font-medium transition ${method === 'upi' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>UPI ID</button>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
              {method === 'card' && (<div className="bg-red-50 p-4 rounded-xl text-center"><ServerCrash className="text-red-500 mx-auto mb-2" /><p className="text-xs text-red-800">Maintenance. Use QR or COD.</p></div>)}
              {method === 'upi' && (<div className="bg-yellow-50 p-4 rounded-xl text-center"><AlertTriangle className="text-yellow-600 mx-auto mb-2" /><p className="text-xs text-yellow-800">Downtime. Use QR or COD.</p></div>)}
              
              {method === 'scan' && (
                  <div className="text-center space-y-4">
                      <p className="text-sm text-gray-600">Scan via any UPI App</p>
                      <div className="border-2 border-dashed border-green-200 p-2 rounded-xl inline-block"><img src={qrCodeImg} alt="QR" className="w-40 h-40 object-contain mx-auto" /></div>
                      <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-md font-bold hover:bg-green-700 transition shadow-md" disabled={isProcessing}>I Have Paid</button>
                  </div>
              )}

              {/* --- NEW COD UI --- */}
              {method === 'cod' && (
                  <div className="text-center space-y-4 bg-blue-50 p-6 rounded-xl border border-blue-100">
                      <Wallet className="mx-auto text-blue-600" size={40} />
                      <h3 className="text-blue-900 font-bold">Pay on Delivery</h3>
                      <p className="text-xs text-blue-700">You can pay via Cash or UPI when the delivery agent arrives.</p>
                      <button type="submit" className="w-full bg-black text-white py-3 rounded-md font-bold hover:bg-gray-800 transition shadow-md" disabled={isProcessing}>Confirm Order</button>
                  </div>
              )}
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 mb-1">Shipping To:</p>
              <p className="text-sm text-gray-700">{shippingAddress.address}, {shippingAddress.city}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payment;