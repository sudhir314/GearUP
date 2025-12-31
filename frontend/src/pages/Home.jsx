import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// --- SWIPER IMPORTS ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Parallax } from 'swiper/modules';

// --- SWIPER STYLES ---
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { ArrowRight, ShieldCheck, Zap, Headphones, BatteryCharging, ShoppingBag, ChevronRight } from 'lucide-react';
import apiClient from '../api/apiClient'; 
import { useCart } from '../context/CartContext'; 
import '../App.css'; 

// --- 1. IMPORT YOUR LOCAL IMAGES HERE ---
// These are the images you already have in src/assets
import heroPhoneImg from '../assets/hero-phone.png'; 
import actionImg from '../assets/action.webp';
import hero2Img from '../assets/hero2.png';

// Blog images
import blog1Img from '../assets/blog1.webp'; 
import blog2Img from '../assets/blog2.webp';
import blog3Img from '../assets/blog3.webp';

// --- 2. UPDATED HERO SLIDES WITH LOCAL IMAGES ---
const heroSlides = [
  {
    id: 1,
    // Using your 'hero-phone.png' for Back Covers
    image: heroPhoneImg, 
    tag: "BEST SELLER",
    title: "Style Meets Protection",
    subtitle: "Discover ultra-slim, shockproof back covers designed to keep your phone safe without hiding its beauty.",
    buttonText: "Shop Covers",
    link: "/shop",
    color: "from-gray-900 to-black"
  },
  {
    id: 2,
    // Using your 'action.webp' for Glass Guards
    image: actionImg, 
    tag: "ULTIMATE CLARITY",
    title: "The Invisible Shield",
    subtitle: "9H Hardness Tempered Glass. Scratch-resistant, shatter-proof, and smooth to the touch.",
    buttonText: "Get Protected",
    link: "/shop",
    color: "from-blue-900 to-black"
  },
  {
    id: 3,
    // Using 'hero2.png' for Essentials/Chargers
    image: hero2Img, 
    tag: "DAILY ESSENTIALS",
    title: "Power & Sound",
    subtitle: "High-speed charging cables and immersive earbuds. Gear up for your daily grind.",
    buttonText: "Shop Accessories",
    link: "/shop",
    color: "from-purple-900 to-black"
  }
];

const blogs = [
    { 
        id: 1,
        title: "Which Screen Protector is Best?", 
        summary: "Tempered glass vs. Hydrogel vs. Matte. We break down the differences...",
        image: blog1Img 
    },
    { 
        id: 2,
        title: "Does Fast Charging Damage Battery?", 
        summary: "It's the most common myth in the tech world. Let's dive into the science...",
        image: blog2Img
    },
    { 
        id: 3,
        title: "Top 5 Rugged Cases for Travel", 
        summary: "Heading for a trek? Don't let a drop ruin your trip...",
        image: blog3Img
    }
];

const Home = () => { 
  const navigate = useNavigate(); 
  const { addToCart } = useCart(); 
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get('/products');
        // Safety check to ensure products is always an array
        const productData = res.data && Array.isArray(res.data) ? res.data : [];
        setProducts(productData.slice(0, 4)); 
      } catch (err) {
        console.error("Failed to load home products", err);
        setProducts([]); 
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="w-full overflow-x-hidden font-sans bg-gray-50">
      
      {/* =========================================
          1. HERO SECTION (Using Local <img> Tags)
         ========================================= */}
      <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-black">
        <Swiper
            modules={[Navigation, Pagination, Autoplay, Parallax]}
            speed={1000} 
            parallax={true} 
            spaceBetween={0}
            slidesPerView={1}
            navigation={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            loop={true}
            className="w-full h-full"
        >
            {heroSlides.map((slide) => (
                <SwiperSlide key={slide.id} className="relative overflow-hidden">
                    
                    {/* FIX: Using a real <img> tag here. 
                       This guarantees the image loads from your local files.
                    */}
                    <div 
                        className="absolute inset-0 w-full h-full"
                        data-swiper-parallax="50%" 
                    >
                         <img 
                            src={slide.image} 
                            alt={slide.title}
                            className="w-full h-full object-cover"
                         />
                         
                         {/* Dark Overlay for text readability */}
                         <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-40 mix-blend-multiply`}></div>
                         <div className="absolute inset-0 bg-black/30"></div>
                    </div>

                    {/* CONTENT CONTAINER */}
                    <div className="relative z-10 h-full container mx-auto px-6 md:px-12 flex items-center">
                        
                        {/* GLASS CARD TEXT BOX */}
                        <div 
                            className="max-w-3xl p-8 md:p-12 rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl" 
                            data-swiper-parallax="-300"
                        > 
                            {/* Tag */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-white/20 bg-black/20 text-white/90 text-xs font-bold tracking-[0.2em] uppercase">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                {slide.tag}
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[0.9] tracking-tight drop-shadow-lg">
                                {slide.title}
                            </h1>

                            {/* Subtitle */}
                            <div className="mb-10 max-w-lg">
                                <p className="text-lg md:text-xl text-gray-100 font-light leading-relaxed drop-shadow-md">
                                    {slide.subtitle}
                                </p>
                            </div>

                            {/* Button */}
                            <Link to={slide.link}>
                                <button className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                    <span className="relative flex items-center gap-3 z-10">
                                        {slide.buttonText} 
                                        <ArrowRight size={18} />
                                    </span>
                                </button>
                            </Link>
                        </div>

                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
      </section>

      {/* =========================================
          2. TRUST STRIP
         ========================================= */}
      <div className="relative z-20 -mt-8 container mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl py-8 px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center justify-center text-center gap-2">
                <ShieldCheck className="text-blue-600 mb-1" size={32} /> 
                <div>
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Tough Protection</h4>
                    <p className="text-xs text-gray-500">Tested for daily drops</p>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center text-center gap-2">
                <Zap className="text-blue-600 mb-1" size={32} /> 
                <div>
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Fast Charging</h4>
                    <p className="text-xs text-gray-500">Speed up your device</p>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center text-center gap-2">
                <BatteryCharging className="text-blue-600 mb-1" size={32} /> 
                <div>
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Premium Quality</h4>
                    <p className="text-xs text-gray-500">Long-lasting materials</p>
                </div>
            </div>
             <div className="flex flex-col items-center justify-center text-center gap-2">
                <Headphones className="text-blue-600 mb-1" size={32} /> 
                <div>
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Clear Audio</h4>
                    <p className="text-xs text-gray-500">Immersive sound experience</p>
                </div>
            </div>
        </div>
      </div>

      {/* =========================================
          3. TRENDING PRODUCTS
         ========================================= */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Trending Now</h2>
                    <p className="text-gray-500">The gear everyone is buying this week.</p>
                </div>
                <Link to="/shop" className="group flex items-center gap-2 font-bold text-blue-600 hover:text-blue-800 transition">
                    View All Products <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.length > 0 ? (
                    products.map(product => (
                        <Link to={`/product/${product._id}`} key={product._id} className="group bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 mb-4">
                                {product.tag && (
                                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold px-3 py-1 rounded-full z-10">
                                        {product.tag}
                                    </span>
                                )}
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700 ease-out" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300"><ShoppingBag size={40}/></div>
                                )}
                                <button 
                                    onClick={(e) => { e.preventDefault(); addToCart(product); }}
                                    className="absolute bottom-4 right-4 bg-black text-white p-3 rounded-full shadow-lg translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600"
                                >
                                    <ShoppingBag size={18} />
                                </button>
                            </div>
                            <div className="px-2 pb-2">
                                <h3 className="font-bold text-gray-900 text-base mb-1 truncate">{product.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-black text-gray-900">₹{product.price}</span>
                                    {product.originalPrice && (
                                        <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                   [1,2,3,4].map(n => <div key={n} className="h-80 bg-gray-200 rounded-3xl animate-pulse"></div>)
                )}
            </div>
        </div>
      </div>

      {/* =========================================
          4. ACTION SECTION (Using Local actionImg)
         ========================================= */}
      <div className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="relative rounded-[3rem] bg-black overflow-hidden shadow-2xl">
                <div className="absolute inset-0 opacity-40">
                    <img src={actionImg} alt="Action" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                
                <div className="relative z-10 p-12 md:p-24 max-w-2xl">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                        Built for the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Daily Grind.</span>
                    </h2>
                    <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                        Don't let a scratched screen or dead battery ruin your day. GearUp accessories are tested for real life.
                    </p>
                    <Link to="/shop">
                        <button className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-xl transform hover:-translate-y-1">
                            Upgrade Now
                        </button>
                    </Link>
                </div>
            </div>
          </div>
      </div>

      {/* =========================================
          5. BLOGS SECTION
         ========================================= */}
      <div className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
              <div className="text-center max-w-2xl mx-auto mb-16">
                 <h2 className="text-3xl font-bold mb-4">Tech Guides</h2>
                 <p className="text-gray-500">Tips on keeping your device fresh and battery healthy.</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                  {blogs.map((blog) => (
                      <div key={blog.id} onClick={() => navigate(`/blog/${blog.id}`)} className="group cursor-pointer">
                          <div className="aspect-[16/10] rounded-2xl mb-6 overflow-hidden shadow-md bg-gray-200">
                              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Guide</span>
                              <span className="text-xs text-gray-400">• 3 min read</span>
                          </div>
                          <h3 className="font-bold text-xl mb-3 group-hover:text-blue-600 transition leading-snug">{blog.title}</h3>
                          <p className="text-gray-500 text-sm line-clamp-2">{blog.summary}</p>
                      </div>
                  ))}
              </div>
          </div>
      </div>

    </div>
  );
};

export default Home;