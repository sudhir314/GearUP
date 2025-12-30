import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, ShoppingCart, Star, Search } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useCart } from '../context/CartContext'; // Import Context
import toast from 'react-hot-toast';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- FIX: Get addToCart from Context ---
  const { addToCart } = useCart(); 

  const categories = ['All', 'Back Cover', 'Screen Guard', 'Charger', 'Cable', 'Earbuds'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    if (activeCategory !== 'All') {
        result = result.filter(p => p.category === activeCategory);
    }
    if (searchQuery) {
        result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredProducts(result);
  }, [activeCategory, searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const { data } = await apiClient.get('/products');
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (e, product) => {
      e.preventDefault(); // Stop clicking the link
      e.stopPropagation();
      addToCart(product); // Use the context function
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shop Gear</h1>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-3 pb-4 mb-6 scrollbar-hide">
            {categories.map(cat => (
                <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                        activeCategory === cat 
                        ? 'bg-black text-white shadow-lg' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-black'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Product Grid */}
        {loading ? (
             <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div></div>
        ) : filteredProducts.length === 0 ? (
             <div className="text-center py-20 text-gray-500">No products found.</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <Link to={`/product/${product._id}`} key={product._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                        
                        <div className="relative pt-[100%] overflow-hidden bg-gray-100">
                             <img src={product.image} alt={product.name} className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                             {!product.countInStock && (
                                 <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                     <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold rounded">OUT OF STOCK</span>
                                 </div>
                             )}
                        </div>

                        <div className="p-4 flex flex-col flex-grow">
                             <div className="text-xs text-blue-600 font-bold mb-1 uppercase tracking-wide">{product.category}</div>
                             <h3 className="font-bold text-gray-900 mb-1 leading-tight line-clamp-2 flex-grow">{product.name}</h3>
                             
                             <div className="flex items-center gap-1 mb-3">
                                 <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                 <span className="text-xs text-gray-500 font-bold">4.8 (120)</span>
                             </div>

                             <div className="flex items-center justify-between mt-auto">
                                 <div>
                                     <span className="text-lg font-black text-gray-900">₹{product.price}</span>
                                     {product.originalPrice && <span className="ml-2 text-xs text-gray-400 line-through">₹{product.originalPrice}</span>}
                                 </div>
                                 <button 
                                    onClick={(e) => handleAddToCart(e, product)}
                                    disabled={!product.countInStock}
                                    className={`p-2 rounded-full transition-colors ${
                                        product.countInStock 
                                        ? 'bg-black text-white hover:bg-blue-600' 
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                 >
                                     <ShoppingCart size={20} />
                                 </button>
                             </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Shop;