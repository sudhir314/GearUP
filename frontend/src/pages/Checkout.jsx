import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import { MapPin, Plus, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart } = useCart(); // Use Context
  const [loading, setLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
  const [saveForLater, setSaveForLater] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', address: '', city: '', pincode: ''
  });

  // Redirect if cart empty
  useEffect(() => {
    if (!cart || cart.length === 0) navigate('/shop');
  }, [cart, navigate]);

  // Fetch Saved Addresses
  useEffect(() => {
    const fetchUserProfile = async () => {
        try {
            const res = await apiClient.get('/auth/profile');
            if (res.data.addresses && res.data.addresses.length > 0) {
                setSavedAddresses(res.data.addresses);
            }
        } catch (error) {
            console.log("Guest checkout");
        } finally {
            setLoading(false);
        }
    };
    fetchUserProfile();
  }, []);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSelectAddress = (index) => {
      setSelectedAddressIndex(index);
      if (index === -1) {
          setFormData({ fullName: '', phone: '', email: '', address: '', city: '', pincode: '' });
      } else {
          const addr = savedAddresses[index];
          setFormData({
              fullName: addr.fullName, phone: addr.phone, email: addr.email,
              address: addr.address, city: addr.city, pincode: addr.pincode
          });
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedAddressIndex === -1 && saveForLater) {
        try {
            await apiClient.post('/auth/save-address', { address: formData });
            toast.success("Address saved!");
        } catch (error) { console.error("Failed to save address"); }
    }

    // --- KEY CHANGE: NAVIGATE TO PAYMENT WITH DATA ---
    navigate('/payment', { state: { shippingAddress: formData } });
  };

  if (!cart || cart.length === 0) return null;

  return (
    // ... (Keep your existing UI JSX exactly the same, it was good) ...
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2"><MapPin className="text-green-700" /> Shipping Details</h1>
        {/* Render Saved Addresses & Form as you had them ... */}
         {savedAddresses.length > 0 && (
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Saved Addresses</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr, index) => (
                        <div key={index} onClick={() => handleSelectAddress(index)} className={`cursor-pointer p-4 rounded-xl border-2 transition relative ${selectedAddressIndex === index ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                            <div className="font-bold text-gray-800">{addr.fullName}</div>
                            <div className="text-sm text-gray-600">{addr.address}, {addr.city} - {addr.pincode}</div>
                            {selectedAddressIndex === index && <div className="absolute top-3 right-3 text-green-600"><CheckCircle size={20} fill="currentColor" className="text-green-100" /></div>}
                        </div>
                    ))}
                    <div onClick={() => handleSelectAddress(-1)} className={`cursor-pointer p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center h-full min-h-[120px] transition ${selectedAddressIndex === -1 ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}>
                        <Plus size={24} className="text-gray-400 mb-2" /><span className="text-gray-500 font-medium">Add New Address</span>
                    </div>
                </div>
            </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
             <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Full Name</label><input required name="fullName" value={formData.fullName} onChange={handleChange} type="text" className="mt-1 block w-full px-3 py-2 border rounded-md" /></div>
             <div><label className="block text-sm font-medium text-gray-700">Phone</label><input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="mt-1 block w-full px-3 py-2 border rounded-md" /></div>
             <div><label className="block text-sm font-medium text-gray-700">Email</label><input required name="email" value={formData.email} onChange={handleChange} type="email" className="mt-1 block w-full px-3 py-2 border rounded-md" /></div>
             <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Address</label><textarea required name="address" value={formData.address} onChange={handleChange} rows="3" className="mt-1 block w-full px-3 py-2 border rounded-md"></textarea></div>
             <div><label className="block text-sm font-medium text-gray-700">City</label><input required name="city" value={formData.city} onChange={handleChange} type="text" className="mt-1 block w-full px-3 py-2 border rounded-md" /></div>
             <div><label className="block text-sm font-medium text-gray-700">Pincode</label><input required name="pincode" value={formData.pincode} onChange={handleChange} type="text" className="mt-1 block w-full px-3 py-2 border rounded-md" /></div>
             {selectedAddressIndex === -1 && (<div className="md:col-span-2 flex items-center gap-2 mt-2 bg-green-50 p-3 rounded-lg border border-green-100"><input type="checkbox" id="saveAddr" checked={saveForLater} onChange={(e) => setSaveForLater(e.target.checked)} className="w-5 h-5 accent-green-700"/><label htmlFor="saveAddr" className="text-sm font-medium text-gray-700 cursor-pointer">Save this address</label></div>)}
             <div className="md:col-span-2 mt-4"><button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2">Continue to Payment</button></div>
        </form>
      </div>
    </div>
  );
};
export default Checkout;