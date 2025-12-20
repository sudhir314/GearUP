import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Zap, Smartphone, Headphones, BatteryCharging, ShoppingBag } from 'lucide-react';
import apiClient from '../api/apiClient'; 
import { useCart } from '../context/CartContext'; // --- IMPORT HOOK ---

// YOU MUST REPLACE THESE IMAGES IN YOUR ASSETS FOLDER
import actionImg from '../assets/action.webp'; 
import blog1Img from '../assets/blog1.webp'; 
import blog2Img from '../assets/blog2.webp';
import blog3Img from '../assets/blog3.webp';

const blogs = [
    { 
        id: 1,
        title: "Which Screen Protector is Best for iPhone 15?", 
        summary: "Tempered glass vs. Hydrogel vs. Matte. We break down the differences so you can choose the perfect shield for your device...",
        image: blog1Img 
    },
    { 
        id: 2,
        title: "Does Fast Charging Damage Your Battery?", 
        summary: "It's the most common myth in the tech world. Let's dive into the science of lithium-ion batteries and modern charging tech...",
        image: blog2Img
    },
    { 
        id: 3,
        title: "Top 5 Rugged Cases for Outdoor Adventures", 
        summary: "Heading for a trek? Don't let a drop ruin your trip. Here are the toughest military-grade cases available right now...",
        image: blog3Img
    }
];

const Home = () => { // --- REMOVED PROPS ---
  const navigate = useNavigate(); 
  const { addToCart } = useCart(); // --- USE CONTEXT ---
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get('/products');
        setProducts(res.data.slice(0, 4)); 
      } catch (err) {
        console.error("Failed to load home products", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="w-full overflow-x-hidden font-sans">
      
      {/* 1. HERO BANNER */}
      <div className="bg-gradient-to-br from-white via-blue-50 to-gray-100 relative py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
            
            <div className="md:w-1/2 max-w-xl mb-8 md:mb-0 text-center md:text-left z-10">
                <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-blue-600 mb-3 block">
                    Premium Protection & Style
                </span>
                <h2 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight text-gray-900">
                  Upgrade Your <span className="text-blue-600">Mobile Gear.</span>
                </h2>
                <p className="text-base md:text-lg text-gray-600 mb-8 font-light leading-relaxed">
                  Shop the trendiest back covers, ultra-tough screen guards, and high-speed chargers. Designed for durability, crafted for style.
                </p>
                <Link to="/shop">
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-base md:text-lg hover:bg-blue-700 transition transform hover:scale-105 shadow-xl flex items-center justify-center mx-auto md:mx-0 gap-3">
                        Shop Accessories <ArrowRight size={20} />
                    </button>
                </Link>
            </div>

            <div className="md:w-1/2 relative flex justify-center items-center h-64 md:h-[350px] w-full">
                <div className="absolute inset-0 flex items-center justify-center">
                    <Smartphone className="w-32 h-32 md:w-48 md:h-48 text-blue-600/80 animate-pulse" />
                </div>
            </div>
        </div>
      </div>

      {/* 2. BENEFITS */}
      <div className="bg-gray-900 text-white py-6 border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2 text-blue-400"><ShieldCheck size={16}/> Drop Protection</span>
                <span className="flex items-center gap-2 text-green-400"><BatteryCharging size={16}/> Fast Charging</span>
                <span className="flex items-center gap-2 text-purple-400"><Headphones size={16}/> Crystal Audio</span>
                <span className="flex items-center gap-2 text-yellow-400"><Zap size={16}/> Premium Quality</span>
            </div>
          </div>
      </div>

      {/* 3. BEST SELLERS */}
      <div className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Trending Now</h2>
                <p className="text-gray-600">The hottest picks for your phone</p>
            </div>
            
            <div className="w-full max-w-7xl mx-auto">
                {products.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                      {products.map(product => (
                          <Link to={`/product/${product._id}`} key={product._id} className="group cursor-pointer flex flex-col h-full">
                              <div className={`relative aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 transition duration-500 group-hover:shadow-lg`}>
                                  {product.tag && (
                                    <span className="absolute top-3 left-3 bg-black/90 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide z-10">
                                      {product.tag}
                                    </span>
                                  )}
                                  
                                  <div className="absolute top-3 right-3 flex items-center gap-0.5 text-yellow-500 bg-white/80 px-1.5 py-0.5 rounded-full z-10">
                                      <span className="text-xs font-bold">{product.rating || 5}</span>
                                      <Star size={10} fill="currentColor" />
                                  </div>
                                  
                                  {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition">
                                        <ShoppingBag size={48} className="text-gray-600/20" />
                                    </div>
                                  )}
                                  
                                  <div className="absolute bottom-3 left-3 right-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                      <button 
                                        onClick={(e) => { e.preventDefault(); addToCart(product); }} 
                                        className="w-full bg-white text-black text-xs md:text-sm font-bold py-2 md:py-3 rounded-xl shadow-md hover:bg-black hover:text-white transition"
                                      >
                                        Add to Cart
                                      </button>
                                  </div>
                              </div>
                              
                              <div className="mt-auto">
                                  <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1 leading-tight line-clamp-2">{product.name}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                      <span className="text-gray-900 font-bold text-base md:text-lg">Rs. {product.price}</span>
                                      {product.originalPrice && (
                                        <span className="text-gray-400 line-through text-xs md:text-sm">Rs. {product.originalPrice}</span>
                                      )}
                                  </div>
                              </div>
                          </Link>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Loading products...</p>
                  </div>
                )}
            </div>
            
            <div className="text-center mt-10">
                <Link to="/shop" className="inline-block border-b-2 border-black pb-1 text-black font-bold text-sm md:text-base hover:text-blue-600 hover:border-blue-600 transition">
                    View All Products
                </Link>
            </div>
        </div>
      </div>

      {/* 4. BRAND PROMISE */}
      <div className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 text-center max-w-3xl">
              <p className="text-gray-600 mb-6 text-lg md:text-xl leading-relaxed font-light">
                  Our mission is to bring you <span className="text-black font-medium">high-quality, durable, and stylish mobile accessories</span> at unbeatable prices.
              </p>
          </div>
      </div>

      {/* 5. ACTION SECTION */}
      <div className="bg-white py-12 md:py-20 overflow-hidden">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10 md:gap-16">
              <div className="md:w-1/2 z-10 text-center md:text-left">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight text-gray-900">
                    Your Phone Deserves <br/> <span className="text-blue-600">The Best.</span>
                  </h2>
                  <p className="text-gray-600 mb-6 text-base md:text-lg leading-relaxed">
                      Check out our new collection of military-grade shockproof cases and ultra-fast 65W chargers.
                  </p>
                  <Link to="/shop">
                      <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg">
                        Shop Collection
                      </button>
                  </Link>
              </div>
              <div className="md:w-1/2 w-full relative">
                   <div className="absolute -inset-4 bg-blue-200 rounded-[2rem] rotate-3 opacity-30 blur-xl"></div>
                   <div className="relative h-64 md:h-[400px] w-full rounded-2xl overflow-hidden shadow-xl">
                       <img src={actionImg} alt="Mobile Action" className="w-full h-full object-cover hover:scale-105 transition duration-700" />
                   </div>
              </div>
          </div>
        </div>

      {/* 6. BLOGS SECTION */}
      <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-2">Tech Tips</h2>
              <p className="text-center text-gray-500 mb-10">Latest news & reviews</p>
              
              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                  {blogs.map((blog) => (
                      <div key={blog.id} onClick={() => navigate(`/blog/${blog.id}`)} className="group cursor-pointer">
                          <div className="aspect-video rounded-xl mb-4 overflow-hidden shadow-sm bg-gray-100">
                              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
                          </div>
                          <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition leading-snug">{blog.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{blog.summary}</p>
                      </div>
                  ))}
              </div>
          </div>
      </div>

    </div>
  );
};

export default Home;