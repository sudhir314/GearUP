import React, { useState, useMemo, useEffect } from 'react';
import { Star, Heart, SlidersHorizontal, Loader, X, Droplet } from 'lucide-react';
import { Link } from 'react-router-dom'; 
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient'; 
import axios from 'axios'; 
import '../App.css'; // Ensure CSS is imported

const Shop = ({ addToCart, addToWishlist }) => {
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [sortOption, setSortOption] = useState('best-selling');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [showFilters, setShowFilters] = useState(false); 
  
  // Animation State
  const [flyingImage, setFlyingImage] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get('/products');
        setProducts(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        if (axios.isAxiosError(err) && !err.response) {
            toast.error("Network error: Could not reach the API server.");
        } else {
            toast.error("Failed to load products.");
        }
        setLoading(false);
      }
    };
    fetchProducts();
  }, []); 

  // Animation Handler
  const handleAddToCartWithAnimation = (e, product) => {
      e.preventDefault();
      e.stopPropagation(); // Stop link navigation
      
      // Get click coordinates
      const rect = e.target.getBoundingClientRect();
      const style = {
          top: `${rect.top}px`,
          left: `${rect.left}px`,
      };

      // Set the flying image
      setFlyingImage({ src: product.image, style });

      // Trigger actual cart add
      addToCart(product);

      // Remove animation element after it finishes
      setTimeout(() => setFlyingImage(null), 800);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];
    result = result.filter(p => p.isAvailable !== false); 
    
    if (selectedCategory !== 'All') {
        result = result.filter(p => p.category === selectedCategory);
    }

    if (priceRange === 'under-500') {
        result = result.filter(p => p.price < 500);
    } else if (priceRange === '500-1000') {
        result = result.filter(p => p.price >= 500 && p.price <= 1000);
    }

    if (sortOption === 'price-low-high') {
        result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high-low') {
        result.sort((a, b) => b.price - a.price);
    } 

    return result;
  }, [sortOption, selectedCategory, priceRange, products]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader className="animate-spin text-green-700" size={48} />
      </div>
    );
  }

  return (
    <div className="py-8 bg-white min-h-screen relative">
      {/* Flying Image Element */}
      {flyingImage && (
          <img 
            src={flyingImage.src} 
            alt="" 
            className="fly-item" 
            style={flyingImage.style} 
          />
      )}

      <div className="container mx-auto px-4">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Shop All Products</h1>
            
            <div className="flex gap-4 w-full md:w-auto">
                <button 
                    className="md:hidden flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:border-green-600 transition"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <SlidersHorizontal size={18}/> Filters
                </button>

                <select 
                    className="border border-gray-300 px-4 py-2 rounded-lg bg-white w-full md:w-auto focus:outline-none focus:border-green-600 cursor-pointer"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="best-selling">Sort By: Best Selling</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                </select>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10 items-start">
            
            <aside className={`
                w-full md:w-64 bg-white z-20
                ${showFilters ? 'fixed inset-0 p-6 overflow-y-auto' : 'hidden md:block'}
                md:static md:p-0 md:sticky md:top-24 md:h-fit
            `}>
                <div className="flex justify-between items-center md:hidden mb-6">
                    <span className="font-bold text-xl">Filters</span>
                    <button onClick={() => setShowFilters(false)}><X size={24}/></button>
                </div>

                <div className="space-y-8">
                    <div className="border-b border-gray-100 pb-6 md:border-none md:pb-0">
                        <h3 className="font-bold mb-4 text-lg text-gray-900">Category</h3>
                        <div className="space-y-3">
                            {['All', 'Roll-on', 'Foot Spray', 'Intimate', 'Other'].map(cat => (
                                <label key={cat} className="flex items-center gap-3 cursor-pointer group hover:text-green-700 transition">
                                    <input 
                                        type="radio" 
                                        name="category" 
                                        checked={selectedCategory === cat}
                                        onChange={() => setSelectedCategory(cat)}
                                        className="w-4 h-4 accent-green-700 cursor-pointer"
                                    />
                                    <span className={selectedCategory === cat ? "font-semibold text-green-700" : "text-gray-600"}>
                                        {cat}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4 text-lg text-gray-900">Price</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'All Prices', value: 'All' },
                                { label: 'Under Rs. 500', value: 'under-500' },
                                { label: 'Rs. 500 - Rs. 1000', value: '500-1000' }
                            ].map((option) => (
                                <label key={option.value} className="flex items-center gap-3 cursor-pointer group hover:text-green-700 transition">
                                    <input 
                                        type="radio" 
                                        name="price" 
                                        checked={priceRange === option.value} 
                                        onChange={() => setPriceRange(option.value)} 
                                        className="w-4 h-4 accent-green-700 cursor-pointer"
                                    />
                                    <span className={priceRange === option.value ? "font-semibold text-green-700" : "text-gray-600"}>
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            <div className="flex-1 w-full">
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg mb-2">No products found matching your filters.</p>
                        <button 
                            onClick={() => {setSelectedCategory('All'); setPriceRange('All')}} 
                            className="text-green-700 font-bold hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                        {filteredProducts.map(product => (
                            <Link to={`/product/${product._id}`} key={product._id} className="group cursor-pointer flex flex-col h-full"> 
                                <div className={`relative aspect-square rounded-2xl overflow-hidden ${product.imageColor || 'bg-gray-100'} mb-4 transition-all duration-300 group-hover:shadow-lg`}>
                                    {product.tag && (
                                        <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider z-10">
                                            {product.tag}
                                        </span>
                                    )}
                                    <button 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToWishlist && addToWishlist(product); }}
                                        className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white text-gray-400 hover:text-red-500 transition z-10"
                                    >
                                        <Heart size={18} />
                                    </button>

                                    {product.image && product.image.startsWith('http') ? (
                                          <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-20 h-40 bg-white/40 rounded-full border border-white/50 backdrop-blur-sm shadow-sm flex flex-col items-center justify-end pb-4">
                                                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest opacity-50">phitku</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* ANIMATED ADD TO CART BUTTON */}
                                    <div className="absolute bottom-3 left-3 right-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <button 
                                            onClick={(e) => handleAddToCartWithAnimation(e, product)} 
                                            className="w-full bg-white text-black font-bold py-3 rounded-xl shadow-lg hover:bg-black hover:text-white transition text-xs md:text-sm"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col flex-grow">
                                    <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1 leading-snug line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-1 mb-2">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill={i < Math.floor(product.rating || 5) ? "currentColor" : "none"} className={i >= Math.floor(product.rating || 5) ? "text-gray-300" : ""} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-400">({product.reviews || 0})</span>
                                    </div>
                                    <div className="mt-auto flex items-center gap-2">
                                        <span className="text-gray-900 font-bold text-lg">Rs. {product.price}</span>
                                        {product.originalPrice && (
                                            <>
                                                <span className="text-gray-400 line-through text-xs">Rs. {product.originalPrice}</span>
                                                <span className="text-green-600 text-xs font-bold">
                                                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;