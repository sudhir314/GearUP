import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
      // Load cart from local storage on startup
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
      localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // --- ADD TO CART FUNCTION ---
  const addToCart = (product) => {
    setCart(prevCart => {
      const existItem = prevCart.find(x => x._id === product._id);
      if (existItem) {
        toast.success(`Increased quantity of ${product.name}`);
        return prevCart.map(x => x._id === product._id ? { ...x, qty: x.qty + 1 } : x);
      } else {
        toast.success(`${product.name} added to cart!`);
        return [...prevCart, { ...product, qty: 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(x => x._id !== id));
    toast.error("Item removed from cart");
  };

  const updateQty = (id, qty) => {
     setCart(prevCart => prevCart.map(x => x._id === id ? { ...x, qty: Number(qty) } : x));
  };

  const clearCart = () => {
      setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};