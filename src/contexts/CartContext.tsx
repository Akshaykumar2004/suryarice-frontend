import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  weight: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.variantId === newItem.variantId);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.variantId === newItem.variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevItems, { ...newItem, quantity: 1 }];
    });
  };

  const removeFromCart = (variantId: string) => {
    setItems(prevItems => prevItems.filter(item => item.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.variantId === variantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (undefined === context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};