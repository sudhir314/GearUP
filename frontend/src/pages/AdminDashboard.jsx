import React, { useState, useEffect } from 'react';
import axios from '../api/apiClient'; // Use your configured apiClient
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Mobile Covers'); // Default category
  const [countInStock, setCountInStock] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  // Load Products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/products');
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // --- HANDLE FILE SELECTION ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        // Optional: Check file size (e.g. 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large. Max 5MB.");
            return;
        }
        setImage(file);
    }
  };

  // --- HANDLE SUBMIT ---
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!image) {
        toast.error("Please select an image");
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('countInStock', countInStock);
    formData.append('description', description);
    formData.append('image', image); // Must match backend upload.single('image')

    const loadingToast = toast.loading('Uploading Product...');

    try {
      // Axios automatically sets Content-Type to multipart/form-data when sending FormData
      await axios.post('/products', formData);
      
      toast.dismiss(loadingToast);
      toast.success('Product Created Successfully!');
      
      // Reset Form
      setName('');
      setPrice('');
      setCountInStock('');
      setDescription('');
      setImage(null);
      // Refresh list
      fetchProducts();

    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Upload Error:", error.response?.data);
      // Show the actual error message from backend
      toast.error(error.response?.data?.message || 'Failed to create product');
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/products/${id}`);
        toast.success('Product Deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Admin Dashboard</h1>

      {/* --- ADD PRODUCT FORM --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-10 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
        <form onSubmit={submitHandler} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" placeholder="Product Name" required 
              className="border p-2 rounded w-full"
              value={name} onChange={(e) => setName(e.target.value)} 
            />
            <input 
              type="number" placeholder="Price (₹)" required 
              className="border p-2 rounded w-full"
              value={price} onChange={(e) => setPrice(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <select 
               className="border p-2 rounded w-full"
               value={category} onChange={(e) => setCategory(e.target.value)}
             >
               <option value="Mobile Covers">Mobile Covers</option>
               <option value="Chargers">Chargers</option>
               <option value="Cables">Cables</option>
               <option value="Audio">Audio/Headphones</option>
               <option value="Screen Guards">Screen Guards</option>
               <option value="Holders">Phone Holders</option>
               <option value="Materials">Raw Materials</option>
             </select>

            <input 
              type="number" placeholder="Count In Stock" required 
              className="border p-2 rounded w-full"
              value={countInStock} onChange={(e) => setCountInStock(e.target.value)} 
            />
          </div>

          <textarea 
            placeholder="Description" required 
            className="border p-2 rounded w-full h-24"
            value={description} onChange={(e) => setDescription(e.target.value)} 
          ></textarea>

          {/* Image Input */}
          <div className="border p-2 rounded bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          <button 
            type="submit" 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition w-full md:w-auto"
          >
            Create Product
          </button>
        </form>
      </div>

      {/* --- PRODUCT LIST --- */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Existing Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3">ID</th>
                <th className="p-3">NAME</th>
                <th className="p-3">PRICE</th>
                <th className="p-3">CATEGORY</th>
                <th className="p-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-600">{product._id.substring(0, 10)}...</td>
                  <td className="p-3 font-medium">{product.name}</td>
                  <td className="p-3">₹{product.price}</td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3">
                    <button 
                      onClick={() => deleteHandler(product._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="text-center p-4 text-gray-500">No products found.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;