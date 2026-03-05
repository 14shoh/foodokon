import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ restaurantId: null, restaurantName: '', items: [] });

  const addItem = useCallback((restaurantId, restaurantName, item) => {
    setCart(prev => {
      // Reset cart if different restaurant
      if (prev.restaurantId && prev.restaurantId !== restaurantId) {
        if (!window.confirm(`Ваша корзина содержит блюда из "${prev.restaurantName}". Очистить корзину и добавить из нового ресторана?`)) {
          return prev;
        }
        return {
          restaurantId,
          restaurantName,
          items: [{ ...item, quantity: 1 }],
        };
      }

      const existing = prev.items.find(i => i.id === item.id);
      if (existing) {
        return {
          ...prev,
          restaurantId,
          restaurantName,
          items: prev.items.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        restaurantId,
        restaurantName,
        items: [...prev.items, { ...item, quantity: 1 }],
      };
    });
  }, []);

  const removeItem = useCallback((itemId) => {
    setCart(prev => {
      const updated = prev.items
        .map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0);
      return { ...prev, items: updated, restaurantId: updated.length ? prev.restaurantId : null };
    });
  }, []);

  const removeAllOfItem = useCallback((itemId) => {
    setCart(prev => {
      const updated = prev.items.filter(i => i.id !== itemId);
      return { ...prev, items: updated, restaurantId: updated.length ? prev.restaurantId : null };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({ restaurantId: null, restaurantName: '', items: [] });
  }, []);

  const total = cart.items.reduce((sum, i) => sum + i.display_price * i.quantity, 0);
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, removeAllOfItem, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
