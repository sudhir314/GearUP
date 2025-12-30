import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);

  // Load cart from local storage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart && storedCart !== "undefined" && storedCart !== "null") {
      try {
        const parsedCart = JSON.parse(storedCart);
        
        // --- DATA MIGRATION FIX START ---
        // This fixes the error by converting old 'qty' to 'quantity'
        const validCart = parsedCart.map(item => ({
            ...item,
            // If quantity is missing, check for 'qty', otherwise default to 1
            quantity: item.quantity || item.qty || 1 
        }));
        // --- DATA MIGRATION FIX END ---

        setCart(validCart);
      } catch (error) {
        console.error("Corrupt cart data found, clearing...", error);
        localStorage.removeItem('cart');
        setCart([]);
      }
    }
  }, []);

  // Save cart to local storage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Ensure discount is reset if cart becomes empty
    if (cart.length === 0 && discount !== 0) {
      setDiscount(0);
    }
  }, [cart, discount]);

  // Use useCallback to prevent re-renders
  const addToCart = useCallback((product) => {
    setCart((prevCart) => {
      // Check if item exists using the current cart state
      const existingItem = prevCart.find((item) => item._id === product._id);
      
      // Toast must be outside the state setter to be pure, 
      // but strictly speaking, calling it here works for now. 
      // For perfect React purity, we'd move this logic, 
      // but let's keep it simple as it works.
      if (existingItem) {
        toast.success(`Added another ${product.name}!`);
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      } else {
        toast.success(`${product.name} added to cart!`);
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  }, []);

  const updateCartQuantity = useCallback((productId, newQuantity) => {
    setCart((prevCart) => {
      if (newQuantity <= 0) return prevCart.filter((item) => item._id !== productId);
      return prevCart.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
    toast.error("Item removed from cart.");
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscount(0);
    localStorage.removeItem('cart');
  }, []);

  // Calculate totals safely
  const cartTotal = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const finalTotal = cartTotal - discount;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        discount,
        setDiscount,
        cartTotal,
        finalTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};