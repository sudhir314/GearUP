import React, { createContext, useContext, useState, useEffect } from 'react';
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
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error("Corrupt cart data found, clearing...", error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to local storage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (cart.length === 0) setDiscount(0);
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        toast.success(`Added another ${product.name}!`);
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        toast.success(`${product.name} added to cart!`);
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateCartQuantity = (productId, newQuantity) => {
    setCart((prevCart) => {
      if (newQuantity <= 0) return prevCart.filter((item) => item._id !== productId);
      return prevCart.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
    toast.error("Item removed from cart.");
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    localStorage.removeItem('cart');
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
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