
'use client';

import type { CartItem, Ebook } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Ebook) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedCart = localStorage.getItem('hackura-cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    if(isClient) {
      localStorage.setItem('hackura-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isClient]);

  const addToCart = (product: Ebook) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    toast({
      title: 'Added to cart',
      description: `${product.title} has been added to your cart.`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === itemId);
      if (itemToRemove && itemToRemove.quantity > 1) {
        return prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prevItems.filter(item => item.id !== itemId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
