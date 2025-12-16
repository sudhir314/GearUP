import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Star, ShoppingBag, ArrowLeft, Truck, ShieldCheck, Tag, Droplet } from 'lucide-react';
import toast from 'react-hot-toast';
import '../App.css'; 

const ProductDetails = ({ addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Animation State
  const [flyingImage, setFlyingImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      setLoading(true);
      try {
        const productRes = await apiClient.get(`/products/${id}`);
        setProduct(productRes.data);

        const allProductsRes = await apiClient.get('/products');
        const allProducts = allProductsRes.data;
        const others = allProducts.filter(p => p._id !== id);
        const randomSelection = others.sort(() => 0.5 - Math.random()).slice(0, 4);
        setRelatedProducts(randomSelection);

      } catch (error) {
        toast.error("Product not found");
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // Animation Handler
  const handleAddToCartWithAnimation = (e, prod) => {
      const item = prod || product; // Use passed item or main product
      
      // Prevent default only if event exists (sometimes we might call from logic)
      if(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const rect = e.target.getBoundingClientRect();
      const style = {
          top: `${rect.top}px`,
          left: `${rect.left}px`,
      };

      setFlyingImage({ src: item.image, style });
      addToCart(item);
      setTimeout(() => setFlyingImage(null), 800);
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  if (!product) return null;

  return (
    <div className="min-h-screen bg-white py-12 px-4 relative">
      {/* Flying Image Element */}
      {flyingImage && (
          <img 
            src={flyingImage.src} 
            alt="" 
            className="fly-item" 
            style={flyingImage.style} 
          />
      )}

      <div className="container mx-auto max-w-6xl">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-black mb-8 transition">
            <ArrowLeft size={20} className="mr-2" /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-12 items-start mb-20">
            <div className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative">
                {product.tag && (
                    <span className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
                        {product.tag}
                    </span>
                )}
                {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition duration-700" />
                ) : (
                    <div className="h-96 flex items-center justify-center text-gray-400">No Image</div>
                )}
            </div>

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">{product.category}</p>
                </div>

                <div className="flex items-end gap-4 border-b border-gray-100 pb-6">
                    <p className="text-3xl font-bold text-green-700">Rs. {product.price}</p>
                    {product.originalPrice && (
                         <p className="text-xl text-gray-400 line-through mb-1">Rs. {product.originalPrice}</p>
                    )}
                    <div className="ml-auto flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
                        <span className="font-bold text-sm">{product.rating || 5}</span>
                        <Star size={16} fill="currentColor" />
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-3">About this item</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {product.description || "No description available for this product yet."}
                    </p>
                </div>

                <div className="pt-6">
                    {product.isAvailable ? (
                        <div className="flex gap-4">
                            <button 
                                onClick={(e) => handleAddToCartWithAnimation(e, product)}
                                className="flex-1 bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={20} /> Add to Cart
                            </button>
                        </div>
                    ) : (
                        <button disabled className="w-full bg-gray-300 text-gray-500 py-4 rounded-xl font-bold cursor-not-allowed">
                            Out of Stock
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <Truck size={20} className="text-green-600"/> <span>Fast Delivery</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <ShieldCheck size={20} className="text-green-600"/> <span>100% Natural</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <Tag size={20} className="text-green-600"/> <span>Best Prices</span>
                    </div>
                </div>
            </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
            <div className="border-t border-gray-100 pt-16">
                <h2 className="text-2xl font-bold mb-8 text-gray-900">You Might Also Like</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {relatedProducts.map((item) => (
                         <Link to={`/product/${item._id}`} key={item._id} className="group cursor-pointer flex flex-col h-full">
                            <div className={`relative aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 transition duration-500 group-hover:shadow-lg`}>
                                {item.tag && (
                                    <span className="absolute top-3 left-3 bg-black/90 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide z-10">
                                        {item.tag}
                                    </span>
                                )}
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-70">
                                        <Droplet size={32} className="text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="mt-auto">
                                <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1 leading-tight line-clamp-2">{item.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-900 font-bold text-sm">Rs. {item.price}</span>
                                    {item.originalPrice && (
                                        <span className="text-gray-400 line-through text-xs">Rs. {item.originalPrice}</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;