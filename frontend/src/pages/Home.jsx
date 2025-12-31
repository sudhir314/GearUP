import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Zap, Smartphone, Headphones, BatteryCharging, ShoppingBag } from 'lucide-react';
import apiClient from '../api/apiClient'; 
import { useCart } from '../context/CartContext'; 
import '../App.css'; 

// --- IMAGES ---
import hero1 from '../assets/hero-phone.png'; 
import hero2 from '../assets/hero2.png';       

import actionImg from '../assets/action.webp'; 
import blog1Img from '../assets/blog1.webp'; 
import blog2Img from '../assets/blog2.webp';
import blog3Img from '../assets/blog3.webp';

const heroImages = [hero1, hero2]; 

const blogs = [
    { 
        id: 1,
        title: "Which Screen Protector is Best for iPhone 15?", 
        summary: "Tempered glass vs. Hydrogel vs. Matte. We break down the differences...",
        image: blog1Img 
    },
    { 
        id: 2,
        title: "Does Fast Charging Damage Your Battery?", 
        summary: "It's the most common myth in the tech world. Let's dive into the science...",
        image: blog2Img
    },
    { 
        id: 3,
        title: "Top 5 Rugged Cases for Outdoor Adventures", 
        summary: "Heading for a trek? Don't let a drop ruin your trip...",
        image: blog3Img
    }
];

const Home = () => { 
  const navigate = useNavigate(); 
  const { addToCart } = useCart(); 
  const [products, setProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Slideshow Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Slower interval for better viewing

    return () => clearInterval(interval);
  }, []);

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
      <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 relative py-12 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-12">
            
            {/* TEXT SECTION */}
            <div className="md:w-1/2 max-w-xl text-center md:text-left z-10 animate-in slide-in-from-left duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
                    <Star size={12} fill="currentColor" /> Premium Protection
                </div>
                <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-gray-900 tracking-tight">
                  Upgrade Your <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Mobile Gear.
                  </span>
                </h1>
                <p className="text-lg text-gray-600 mb-8 font-medium leading-relaxed max-w-md mx-auto md:mx-0">
                  Shop the trendiest back covers, ultra-tough screen guards, and high-speed chargers. 
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                    <Link to="/shop">
                        <button className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition transform hover:-translate-y-1 shadow-xl flex items-center gap-3">
                            Shop Now <ArrowRight size={20} />
                        </button>
                    </Link>
                    <Link to="/shop">
                        <button className="px-8 py-4 rounded-full font-bold text-lg text-gray-600 border border-gray-300 hover:bg-white hover:border-gray-400 transition">
                            View Collections
                        </button>
                    </Link>
                </div>
            </div>

            {/* --- PHONE FRAME SECTION (FIXED) --- */}
            <div className="md:w-1/2 relative flex justify-center items-center w-full z-10">
                
                {/* Glow Effect Behind */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-400/20 rounded-full blur-[80px] -z-10"></div>

                {/* THE PHONE CONTAINER */}
                {/* We removed the manual borders and used the CSS class 'phone-frame-shadow' for a cleaner look */}
                <div className="phone-frame-shadow relative bg-black rounded-[3rem] h-[600px] w-[300px] overflow-hidden transform transition duration-500 hover:scale-[1.02]">
                    
                    {/* Dynamic Island / Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[28px] w-[100px] bg-black z-20 rounded-b-2xl"></div>
                    
                    {/* Screen Area */}
                    <div className="w-full h-full bg-gray-800 relative overflow-hidden rounded-[2.5rem]">
                        {heroImages.map((img, index) => (
                            <div 
                                key={index}
                                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                            >
                                {/* APPLYING THE NEW ZOOM ANIMATION HERE */}
                                <img 
                                    src={img} 
                                    alt={`Slide ${index}`} 
                                    className={`w-full h-full object-cover ${index === currentImageIndex ? 'animate-zoom' : ''}`}
                                />
                                
                                {/* Dark Gradient Overlay (Makes white text readable if image is bright) */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                
                                {/* Optional: Text Overlay on Phone */}
                                <div className="absolute bottom-8 left-0 right-0 text-center text-white px-4">
                                    <p className="font-bold text-lg drop-shadow-md">New Arrivals</p>
                                    <p className="text-xs text-gray-200">Winter Collection 2025</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* ----------------------------------- */}

        </div>
      </div>

      {/* 2. BENEFITS STRIP */}
      <div className="bg-black text-white py-8 border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-between md:justify-center md:gap-16 gap-y-6 text-center">
                <div className="flex flex-col items-center gap-2 w-1/2 md:w-auto">
                    <ShieldCheck className="text-blue-500 mb-1" size={28}/> 
                    <span className="font-bold text-sm uppercase tracking-wider">Drop Protection</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-1/2 md:w-auto">
                    <BatteryCharging className="text-green-500 mb-1" size={28}/> 
                    <span className="font-bold text-sm uppercase tracking-wider">Fast Charging</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-1/2 md:w-auto">
                    <Headphones className="text-purple-500 mb-1" size={28}/> 
                    <span className="font-bold text-sm uppercase tracking-wider">Crystal Audio</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-1/2 md:w-auto">
                    <Zap className="text-yellow-500 mb-1" size={28}/> 
                    <span className="font-bold text-sm uppercase tracking-wider">Premium Quality</span>
                </div>
            </div>
          </div>
      </div>

      {/* 3. BEST SELLERS */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Trending Now</h2>
                <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="w-full max-w-7xl mx-auto">
                {products.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                      {products.map(product => (
                          <Link to={`/product/${product._id}`} key={product._id} className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl p-4 hover:shadow-xl transition border border-gray-100">
                              <div className={`relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 mb-4`}>
                                  {product.tag && (
                                    <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
                                      {product.tag}
                                    </span>
                                  )}
                                  
                                  {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-70">
                                        <ShoppingBag size={48} className="text-gray-300" />
                                    </div>
                                  )}
                                  
                                  <div className="absolute bottom-2 left-2 right-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                      <button 
                                        onClick={(e) => { e.preventDefault(); addToCart(product); }} 
                                        className="w-full bg-black text-white text-xs font-bold py-3 rounded-lg hover:bg-gray-800 transition shadow-lg"
                                      >
                                        Add to Cart
                                      </button>
                                  </div>
                              </div>
                              
                              <div className="mt-auto">
                                  <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1 line-clamp-2 leading-tight group-hover:text-blue-600 transition">{product.name}</h3>
                                  <div className="flex items-center justify-between mt-2">
                                      <span className="text-gray-900 font-extrabold text-base">₹{product.price}</span>
                                      {product.originalPrice && (
                                        <span className="text-gray-400 line-through text-xs">₹{product.originalPrice}</span>
                                      )}
                                  </div>
                              </div>
                          </Link>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium">Loading products...</p>
                  </div>
                )}
            </div>
            
            <div className="text-center mt-12">
                <Link to="/shop" className="inline-block px-8 py-3 rounded-full border border-gray-300 font-bold text-gray-700 hover:bg-black hover:text-white hover:border-black transition">
                    View All Products
                </Link>
            </div>
        </div>
      </div>

      {/* 4. BRAND PROMISE / MISSION */}
      <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 text-center max-w-3xl">
              <Star className="w-10 h-10 text-yellow-400 mx-auto mb-6 fill-current" />
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-600 text-xl leading-relaxed font-light">
                  To bring you <span className="text-black font-medium">high-quality, durable, and stylish</span> mobile accessories at unbeatable prices. Your device deserves the best protection without breaking the bank.
              </p>
          </div>
      </div>

      {/* 5. ACTION SECTION */}
      <div className="bg-white py-12 md:py-24 overflow-hidden">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10 md:gap-16">
              <div className="md:w-1/2 z-10 text-center md:text-left">
                  <h2 className="text-4xl md:text-6xl font-black mb-6 leading-none tracking-tight">
                    Your Phone. <br/> <span className="text-blue-600">Protected.</span>
                  </h2>
                  <p className="text-gray-500 mb-8 text-lg leading-relaxed max-w-md mx-auto md:mx-0">
                      Discover our new collection of military-grade shockproof cases and ultra-fast 65W chargers.
                  </p>
                  <Link to="/shop">
                      <button className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                        Shop Collection
                      </button>
                  </Link>
              </div>
              <div className="md:w-1/2 w-full relative group">
                   <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                   <div className="relative h-64 md:h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl">
                       <img src={actionImg} alt="Mobile Action" className="w-full h-full object-cover transform group-hover:scale-105 transition duration-1000" />
                   </div>
              </div>
          </div>
        </div>

      {/* 6. BLOGS SECTION */}
      <div className="py-20 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4">
              <div className="flex justify-between items-end mb-10">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Tech Tips</h2>
                    <p className="text-gray-500">Latest news & reviews from our experts</p>
                  </div>
                  <Link to="/blogs" className="hidden md:block text-blue-600 font-bold hover:underline">Read All Articles</Link>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                  {blogs.map((blog) => (
                      <div key={blog.id} onClick={() => navigate(`/blog/${blog.id}`)} className="group cursor-pointer">
                          <div className="aspect-[16/9] rounded-2xl mb-5 overflow-hidden shadow-sm bg-gray-100 relative">
                              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
                          </div>
                          <h3 className="font-bold text-xl mb-3 group-hover:text-blue-600 transition leading-tight">{blog.title}</h3>
                          <p className="text-gray-500 line-clamp-2 leading-relaxed">{blog.summary}</p>
                      </div>
                  ))}
              </div>
          </div>
      </div>

    </div>
  );
};

export default Home;