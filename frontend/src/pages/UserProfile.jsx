import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { User, MapPin, Package, Clock, CheckCircle, Truck, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await apiClient.get('/auth/profile');
        setUser(profileRes.data);

        const ordersRes = await apiClient.get('/orders/myorders');
        setOrders(ordersRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Session expired. Please login again.");
        localStorage.removeItem('token'); 
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
      try {
          await apiClient.post('/auth/logout');
          localStorage.removeItem('token');
          navigate('/');
          toast.success("Logged out successfully");
      } catch (error) {
          console.error(error);
      }
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'Delivered': return 'text-green-600 bg-green-100 border-green-200';
          case 'Shipped': return 'text-blue-600 bg-blue-100 border-blue-200';
          case 'Cancelled': return 'text-red-600 bg-red-100 border-red-200';
          default: return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Profile & Addresses */}
            <div className="md:col-span-1 space-y-6">
                
                {/* Profile Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                            <User size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                    {user?.isAdmin && (
                        <div className="mb-4">
                             <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Admin Account</span>
                        </div>
                    )}
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-semibold"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>

                {/* Saved Addresses */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-gray-400" /> Saved Addresses
                    </h3>
                    
                    {user?.addresses && user.addresses.length > 0 ? (
                        <div className="space-y-4">
                            {user.addresses.map((addr, idx) => (
                                <div key={idx} className="p-3 border rounded-xl bg-gray-50 text-sm">
                                    <p className="font-bold text-gray-900">{addr.fullName}</p>
                                    <p className="text-gray-600">{addr.address}</p>
                                    <p className="text-gray-600">{addr.city} - {addr.pincode}</p>
                                    <p className="text-gray-500 mt-1">{addr.phone}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm italic">No addresses saved yet.</p>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: Order History */}
            {/* Added mt-6 for mobile to separate from top section clearly */}
            <div className="md:col-span-2 mt-6 md:mt-0">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Package className="text-green-700" /> Order History
                </h3>

                {orders.length === 0 ? (
                    <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <h4 className="text-xl font-bold text-gray-600">No orders yet</h4>
                        <p className="text-gray-500 mb-6">Looks like you haven't bought anything yet.</p>
                        <button onClick={() => navigate('/shop')} className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-800 transition">
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Order Header */}
                                <div className="bg-gray-50 p-4 flex flex-wrap justify-between items-center gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Order ID</p>
                                        <p className="text-sm font-mono font-medium text-gray-700">#{order._id.substring(0, 10)}...</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Date</p>
                                        <p className="text-sm font-medium text-gray-700">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total</p>
                                        <p className="text-sm font-bold text-green-700">Rs. {order.totalPrice}</p>
                                    </div>
                                    <div>
                                         <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                            {order.status === 'Processing' && <Clock size={12} />}
                                            {order.status === 'Shipped' && <Truck size={12} />}
                                            {order.status === 'Delivered' && <CheckCircle size={12} />}
                                            {order.status}
                                         </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                                <span className="font-medium text-gray-800">{item.name}</span>
                                                <span className="text-xs text-gray-500">x{item.quantity}</span>
                                            </div>
                                            <span className="text-sm text-gray-600">Rs. {item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                {order.status === 'Delivered' && (
                                    <div className="bg-green-50 px-4 py-2 text-xs text-green-700 text-center font-medium">
                                        This order has been delivered. Thank you for shopping with Phitku!
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;