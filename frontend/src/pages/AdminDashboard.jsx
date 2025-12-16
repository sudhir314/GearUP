import React, { useState, useEffect } from 'react';
import { Package, Truck, Plus, Edit, Trash2, X, Menu, TicketPercent, BarChart2, Users, DollarSign, Eye, MapPin } from 'lucide-react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']; // Changed to Blue/Modern Theme

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

  // UPDATED FORM DATA STATE
  const [formData, setFormData] = useState({
    name: '', price: '', originalPrice: '', category: 'Back Cover', 
    tag: '', description: '', isAvailable: true, image: '',
    brand: '', compatibility: '', color: '', material: '' // New Fields
  });
  
  const [couponData, setCouponData] = useState({ code: '', discountPercentage: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
          const res = await apiClient.get('/admin/stats');
          setStats(res.data);
      } else if (activeTab === 'products') {
        const res = await apiClient.get('/products');
        setProducts(res.data);
      } else if (activeTab === 'orders') {
        const res = await apiClient.get('/orders/all-orders');
        setOrders(res.data);
      } else if (activeTab === 'coupons') {
        const res = await apiClient.get('/coupons');
        setCoupons(res.data);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
      }
  };

  const handleSubmitProduct = async (e) => {
      e.preventDefault();
      const data = new FormData();
      // Basic Fields
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('originalPrice', formData.originalPrice);
      data.append('category', formData.category);
      data.append('tag', formData.tag);
      data.append('description', formData.description);
      data.append('isAvailable', formData.isAvailable);
      
      // New Mobile Fields
      data.append('brand', formData.brand);
      data.append('compatibility', formData.compatibility);
      data.append('color', formData.color);
      data.append('material', formData.material);

      if (imageFile) data.append('imageFile', imageFile);
      else data.append('image', formData.image);

      try {
          if (editingProduct) {
              await apiClient.put(`/products/${editingProduct._id}`, data);
              toast.success("Product Updated!");
          } else {
              await apiClient.post('/products', data);
              toast.success("Product Created!");
          }
          setShowModal(false);
          setEditingProduct(null);
          fetchData();
      } catch (error) {
          toast.error("Operation failed.");
      }
  };

  const handleDeleteProduct = async (id) => {
      if(window.confirm("Are you sure?")) {
          try { await apiClient.delete(`/products/${id}`); toast.success("Product Deleted"); fetchData(); } 
          catch (error) { toast.error("Delete failed"); }
      }
  };

  const handleCouponSubmit = async (e) => {
      e.preventDefault();
      try {
          await apiClient.post('/coupons', couponData);
          toast.success("Coupon Created!");
          setCouponData({ code: '', discountPercentage: '' });
          fetchData();
      } catch (error) { toast.error("Failed to create coupon"); }
  };

  const handleDeleteCoupon = async (id) => {
      if(window.confirm("Delete?")) {
          try { await apiClient.delete(`/coupons/${id}`); toast.success("Deleted"); fetchData(); } 
          catch (error) { toast.error("Delete failed"); }
      }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
        await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
        toast.success(`Updated to ${newStatus}`);
        fetchData();
    } catch (error) { toast.error("Failed to update status"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
          <h2 className="text-xl font-bold text-blue-400">Mobile Gear Admin</h2>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg">
              {isSidebarOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
      </div>

      {/* Sidebar */}
      <div className={`
          bg-gray-900 text-white p-6 fixed h-full z-40 w-64 transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:block
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <h2 className="text-2xl font-bold mb-8 text-blue-400 hidden md:block">Mobile Gear</h2>
        <nav className="space-y-4">
          <button onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'analytics' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            <BarChart2 size={20} /> Analytics
          </button>
          <button onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'products' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            <Package size={20} /> Products
          </button>
          <button onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'orders' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            <Truck size={20} /> Orders
          </button>
          <button onClick={() => { setActiveTab('coupons'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'coupons' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            <TicketPercent size={20} /> Coupons
          </button>
        </nav>
      </div>

      {/* Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 w-full overflow-x-hidden">
         <h1 className="text-2xl md:text-3xl font-bold mb-6 capitalize text-gray-800">{activeTab} Management</h1>

         {loading ? <p>Loading...</p> : (
             <>
                {/* ANALYTICS TAB */}
                {activeTab === 'analytics' && stats && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600"><DollarSign size={24}/></div>
                                <div><p className="text-gray-500 text-sm">Revenue</p><h3 className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</h3></div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Truck size={24}/></div>
                                <div><p className="text-gray-500 text-sm">Orders</p><h3 className="text-2xl font-bold">{stats.ordersCount}</h3></div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Users size={24}/></div>
                                <div><p className="text-gray-500 text-sm">Users</p><h3 className="text-2xl font-bold">{stats.usersCount}</h3></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-6 text-gray-800">Sales Trend</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.dailySales}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="_id" hide />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={3} dot={{r: 4}} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PRODUCTS TAB */}
                {activeTab === 'products' && (
                    <div>
                        <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold mb-6 flex items-center gap-2 hover:bg-blue-700">
                            <Plus size={20}/> Add Product
                        </button>
                        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-gray-100 border-b">
                                    <tr><th className="p-4">Image</th><th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Actions</th></tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p._id} className="border-b hover:bg-gray-50">
                                            <td className="p-4"><img src={p.image} alt="" className="w-12 h-12 rounded object-cover bg-gray-100"/></td>
                                            <td className="p-4 font-bold">{p.name}</td>
                                            <td className="p-4 text-sm text-gray-500">{p.category}</td>
                                            <td className="p-4">₹{p.price}</td>
                                            <td className="p-4 flex gap-3">
                                                <button onClick={() => { setEditingProduct(p); setFormData(p); setImagePreview(p.image); setShowModal(true); }} className="text-blue-600"><Edit size={18}/></button>
                                                <button onClick={() => handleDeleteProduct(p._id)} className="text-red-600"><Trash2 size={18}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="p-4">Order ID</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4">View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-mono text-xs text-gray-500">#{order._id.slice(-6)}</td>
                                        <td className="p-4"><div className="font-bold">{order.shippingAddress?.fullName}</div></td>
                                        <td className="p-4 font-bold">₹{order.totalPrice}</td>
                                        <td className="p-4"><span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">{order.status}</span></td>
                                        <td className="p-4">
                                            <select className="border rounded px-2 py-1 text-sm" value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)}>
                                                <option value="Processing">Processing</option><option value="Shipped">Shipped</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <button onClick={() => setViewingOrder(order)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition"><Eye size={20}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* COUPONS TAB */}
                {activeTab === 'coupons' && (
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-md">
                            <h3 className="font-bold text-lg mb-4">Create Coupon</h3>
                            <form onSubmit={handleCouponSubmit} className="space-y-4">
                                <input type="text" placeholder="Code (e.g. SALE50)" className="w-full border p-2 rounded-lg uppercase" value={couponData.code} onChange={(e) => setCouponData({...couponData, code: e.target.value})} required />
                                <input type="number" placeholder="Discount %" className="w-full border p-2 rounded-lg" value={couponData.discountPercentage} onChange={(e) => setCouponData({...couponData, discountPercentage: e.target.value})} min="1" max="100" required />
                                <button type="submit" className="w-full bg-black text-white py-2 rounded-lg font-bold">Create</button>
                            </form>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                            <table className="w-full text-left min-w-[400px]">
                                <thead className="bg-gray-100 border-b"><tr><th className="p-4">Code</th><th className="p-4">Discount</th><th className="p-4">Action</th></tr></thead>
                                <tbody>
                                    {coupons.map(c => (
                                        <tr key={c._id} className="border-b"><td className="p-4 font-bold text-green-700">{c.code}</td><td className="p-4">{c.discountPercentage}%</td><td className="p-4"><button onClick={() => handleDeleteCoupon(c._id)} className="text-red-600"><Trash2 size={18}/></button></td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
             </>
         )}
      </div>

      {/* PRODUCT MODAL - UPDATED WITH MOBILE FIELDS */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                    <button onClick={() => setShowModal(false)}><X size={24}/></button>
                </div>
                <form onSubmit={handleSubmitProduct} className="space-y-4">
                    {/* Basic Info */}
                    <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Product Name (e.g. iPhone 15 Case)" className="w-full border p-2 rounded" required />
                    
                    <div className="grid grid-cols-2 gap-4">
                         <input name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="Price" className="w-full border p-2 rounded" required />
                         <input name="originalPrice" type="number" value={formData.originalPrice} onChange={handleInputChange} placeholder="Original Price" className="w-full border p-2 rounded" />
                    </div>

                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border p-2 rounded">
                        <option value="Back Cover">Back Cover</option>
                        <option value="Screen Guard">Screen Guard</option>
                        <option value="Charger">Charger</option>
                        <option value="Cable">Cable</option>
                        <option value="Earbuds">Earbuds</option>
                    </select>

                    {/* NEW MOBILE FIELDS */}
                    <div className="grid grid-cols-2 gap-4">
                        <input name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Brand (e.g. Samsung)" className="w-full border p-2 rounded" />
                        <input name="compatibility" value={formData.compatibility} onChange={handleInputChange} placeholder="Model (e.g. S24 Ultra)" className="w-full border p-2 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="color" value={formData.color} onChange={handleInputChange} placeholder="Color (e.g. Black)" className="w-full border p-2 rounded" />
                        <input name="material" value={formData.material} onChange={handleInputChange} placeholder="Material (e.g. Silicon)" className="w-full border p-2 rounded" />
                    </div>

                    <input name="tag" value={formData.tag} onChange={handleInputChange} placeholder="Tag (e.g. Best Seller)" className="w-full border p-2 rounded" />
                    <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" className="w-full border p-2 rounded h-20"></textarea>
                    
                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleInputChange} id="stock" />
                        <label htmlFor="stock">In Stock</label>
                    </div>
                    
                    <input type="file" onChange={handleFileChange} className="w-full border p-2 rounded" />
                    {imagePreview && <img src={imagePreview} alt="Preview" className="h-20 object-cover rounded" />}
                    
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">Save Product</button>
                </form>
            </div>
        </div>
      )}

      {/* VIEW ORDER MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">Order #{viewingOrder._id.slice(-6)}</h2>
                    <button onClick={() => setViewingOrder(null)}><X size={24}/></button>
                </div>
                <div className="space-y-4">
                     <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-bold">{viewingOrder.shippingAddress?.fullName}</p>
                        <p className="text-sm text-gray-600">{viewingOrder.shippingAddress?.address}, {viewingOrder.shippingAddress?.city}</p>
                        <p className="text-sm text-gray-600">Phone: {viewingOrder.shippingAddress?.phone}</p>
                     </div>
                     <div>
                        {viewingOrder.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between border-b py-2 text-sm">
                                <span>{item.quantity}x {item.name}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                     </div>
                     <div className="flex justify-between font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>₹{viewingOrder.totalPrice}</span>
                     </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;