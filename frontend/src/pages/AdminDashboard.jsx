import React, { useState, useEffect } from 'react';
import { Package, Truck, Plus, Edit, Trash2, X, Menu, TicketPercent, BarChart2, Users, DollarSign, Eye, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Pagination States
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

  // Form Data State
  const [formData, setFormData] = useState({
    name: '', price: '', originalPrice: '', category: 'Back Cover', 
    tag: '', description: '', isAvailable: true, 
    existingImages: [], // URLs of images already on server
    newFiles: [],       // File objects for new uploads
    brand: '', compatibility: '', color: '', material: ''
  });
  
  const [couponData, setCouponData] = useState({ code: '', discountPercentage: '' });

  // Fetch Data on Tab Change or Page Change
  useEffect(() => { 
      fetchData(); 
      // eslint-disable-next-line
  }, [activeTab, productPage, orderPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
          const res = await apiClient.get('/admin/stats');
          setStats(res.data);
      } else if (activeTab === 'products') {
        const res = await apiClient.get(`/products?page=${productPage}&limit=10`);
        if (res.data.products) {
            setProducts(res.data.products);
            setProductTotalPages(res.data.pages);
        } else {
            setProducts(res.data);
        }
      } else if (activeTab === 'orders') {
        const res = await apiClient.get(`/orders/all-orders?page=${orderPage}&limit=10`);
        if (res.data.orders) {
            setOrders(res.data.orders);
            setOrderTotalPages(res.data.pages);
        } else {
            setOrders(res.data);
        }
      } else if (activeTab === 'coupons') {
        const res = await apiClient.get('/coupons');
        setCoupons(res.data);
      }
    } catch (error) { toast.error("Failed to load data"); } finally { setLoading(false); }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Handle Multiple File Uploads
  const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
          setFormData(prev => ({
              ...prev,
              newFiles: [...prev.newFiles, ...files]
          }));
      }
  };

  const removeNewFile = (index) => {
      setFormData(prev => ({
          ...prev,
          newFiles: prev.newFiles.filter((_, i) => i !== index)
      }));
  };

  const removeExistingImage = (index) => {
      setFormData(prev => ({
          ...prev,
          existingImages: prev.existingImages.filter((_, i) => i !== index)
      }));
  };

  const handleSubmitProduct = async (e) => {
      e.preventDefault();
      
      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('originalPrice', formData.originalPrice);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('brand', formData.brand);
      data.append('compatibility', formData.compatibility);
      data.append('color', formData.color);
      data.append('material', formData.material);
      data.append('tag', formData.tag);
      data.append('isAvailable', formData.isAvailable);

      formData.existingImages.forEach(img => {
          data.append('existingImages', img);
      });

      try {
          if (editingProduct) {
              formData.newFiles.forEach(file => {
                  data.append('newImages', file);
              });

              await apiClient.put(`/products/${editingProduct._id}`, data, {
                  headers: { 'Content-Type': 'multipart/form-data' }
              });
              toast.success("Product Updated!");
          } else {
              formData.newFiles.forEach(file => {
                  data.append('images', file);
              });

              await apiClient.post('/products', data, {
                  headers: { 'Content-Type': 'multipart/form-data' }
              });
              toast.success("Product Created!");
          }
          setShowModal(false); setEditingProduct(null); fetchData();
      } catch (error) { 
          console.error("Product Save Error:", error);
          toast.error(error.response?.data?.message || "Operation failed."); 
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

  const openEditModal = (product) => {
      setEditingProduct(product);
      setFormData({
          ...product,
          existingImages: product.images || (product.image ? [product.image] : []),
          newFiles: [] 
      });
      setShowModal(true);
  };

  const openAddModal = () => {
      setEditingProduct(null);
      setFormData({
          name: '', price: '', originalPrice: '', category: 'Back Cover', tag: '', description: '', isAvailable: true, 
          existingImages: [], newFiles: [], 
          brand: '', compatibility: '', color: '', material: ''
      });
      setShowModal(true);
  };

  const PaginationControls = ({ page, totalPages, setPage }) => (
      <div className="flex justify-center items-center gap-4 mt-6">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="p-2 rounded-full bg-white border shadow-sm disabled:opacity-50 hover:bg-gray-50"
          >
              <ChevronLeft size={20}/>
          </button>
          <span className="text-sm font-bold text-gray-600">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-full bg-white border shadow-sm disabled:opacity-50 hover:bg-gray-50"
          >
              <ChevronRight size={20}/>
          </button>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
          <h2 className="flex items-center gap-1">
             <span className="text-logo" style={{fontSize: '1.5rem', color: 'white'}}>Gear <span style={{color: '#60A5FA'}}>UP</span></span>
             <span className="text-gray-400 text-sm font-bold mt-1 ml-1">Admin</span>
          </h2>
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
        <div className="mb-8 hidden md:block">
            <h2 className="text-logo" style={{fontSize: '2rem', color: 'white'}}>Gear <span style={{color: '#60A5FA'}}>UP</span></h2>
            <p className="text-gray-500 text-xs font-bold tracking-widest mt-1">ADMIN DASHBOARD</p>
        </div>

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

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      <div className="flex-1 p-4 md:p-8 w-full overflow-x-hidden">
         <h1 className="text-2xl md:text-3xl font-bold mb-6 capitalize text-gray-800">{activeTab} Management</h1>

         {loading ? <p>Loading...</p> : (
             <>
                {/* ANALYTICS */}
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
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg mb-6 text-gray-800">Sales Trend</h3>
                            {/* --- FIX APPLIED HERE: Added w-full --- */}
                            <div className="h-64 w-full">
                                {/* --- FIX APPLIED HERE: Added minWidth={0} --- */}
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                )}

                {/* PRODUCTS */}
                {activeTab === 'products' && (
                    <div>
                        <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold mb-6 flex items-center gap-2 hover:bg-blue-700">
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
                                            <td className="p-4"><img src={p.images && p.images.length > 0 ? p.images[0] : p.image} alt="" className="w-12 h-12 rounded object-cover bg-gray-100"/></td>
                                            <td className="p-4 font-bold">{p.name}</td>
                                            <td className="p-4 text-sm text-gray-500">{p.category}</td>
                                            <td className="p-4">₹{p.price}</td>
                                            <td className="p-4 flex gap-3">
                                                <button onClick={() => openEditModal(p)} className="text-blue-600"><Edit size={18}/></button>
                                                <button onClick={() => handleDeleteProduct(p._id)} className="text-red-600"><Trash2 size={18}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls page={productPage} totalPages={productTotalPages} setPage={setProductPage} />
                    </div>
                )}

                {/* ORDERS */}
                {activeTab === 'orders' && (
                    <div>
                        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="p-4">Order ID</th><th className="p-4">Customer</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Action</th><th className="p-4">View</th>
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
                        <PaginationControls page={orderPage} totalPages={orderTotalPages} setPage={setOrderPage} />
                    </div>
                )}

                {/* COUPONS */}
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

      {/* PRODUCT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                    <button onClick={() => setShowModal(false)}><X size={24}/></button>
                </div>
                <form onSubmit={handleSubmitProduct} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Product Name" className="w-full border p-2 rounded" required />
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
                    <div className="grid grid-cols-2 gap-4">
                        <input name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Brand" className="w-full border p-2 rounded" />
                        <input name="compatibility" value={formData.compatibility} onChange={handleInputChange} placeholder="Model" className="w-full border p-2 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="color" value={formData.color} onChange={handleInputChange} placeholder="Color" className="w-full border p-2 rounded" />
                        <input name="material" value={formData.material} onChange={handleInputChange} placeholder="Material" className="w-full border p-2 rounded" />
                    </div>
                    <input name="tag" value={formData.tag} onChange={handleInputChange} placeholder="Tag" className="w-full border p-2 rounded" />
                    <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" className="w-full border p-2 rounded h-20"></textarea>
                    
                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleInputChange} id="stock" />
                        <label htmlFor="stock">In Stock</label>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold mb-2">Product Images</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition relative cursor-pointer">
                            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Upload className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Click to upload new images</p>
                        </div>
                        
                        {formData.existingImages.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-bold text-gray-500 mb-2">Existing:</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {formData.existingImages.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded overflow-hidden bg-gray-100 border">
                                            <img src={img} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formData.newFiles.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-bold text-green-600 mb-2">New Uploads:</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {formData.newFiles.map((file, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded overflow-hidden bg-gray-100 border border-green-200">
                                            <img src={URL.createObjectURL(file)} alt={`New ${idx}`} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeNewFile(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
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