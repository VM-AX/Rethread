import React, { createContext, useContext, useMemo, useState } from 'react';

// Simple client-side cart (in-memory + localStorage). Since most listings
// are single-quantity secondhand items, this mainly tracks selected
// listings prior to checkout.
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem('rethread_cart');
    return stored ? JSON.parse(stored) : [];
  });

  const persist = (next) => {
    setItems(next);
    localStorage.setItem('rethread_cart', JSON.stringify(next));
  };

  const addItem = (listing, offerId) => {
    if (items.some((i) => i.listingId === listing._id)) return;
    persist([
      ...items,
      {
        listingId: listing._id,
        title: listing.title,
        price: listing.price,
        image: listing.images?.[0]?.url,
        category: listing.category,
        quantity: 1,
        offerId: offerId || undefined,
      },
    ]);
  };

  const removeItem = (listingId) => persist(items.filter((i) => i.listingId !== listingId));
  const clearCart = () => persist([]);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
