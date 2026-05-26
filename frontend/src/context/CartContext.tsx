'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { catalogApi, CartItem } from '@/lib/api';
import { auth } from '@/lib/auth';

interface CartCtx {
  items: CartItem[];
  add: (item: CartItem) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => void;
  subtotal: number;
  count: number;
}
const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Hydrate cart from server (if logged in) else from localStorage
  useEffect(() => {
    const u = auth.getUser();
    if (u?.id) {
      catalogApi.getCart(u.id).then(c => setItems(c.items || [])).catch(() => {});
    } else {
      const local = localStorage.getItem('cart');
      if (local) setItems(JSON.parse(local));
    }
  }, []);

  // Persist to localStorage as fallback
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const add = useCallback(async (item: CartItem) => {
    const u = auth.getUser();
    if (u?.id) {
      const c = await catalogApi.addToCart(u.id, item);
      setItems(c.items);
    } else {
      setItems(prev => {
        const existing = prev.find(i => i.productId === item.productId);
        if (existing) return prev.map(i => i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i);
        return [...prev, item];
      });
    }
  }, []);

  const remove = useCallback(async (productId: string) => {
    const u = auth.getUser();
    if (u?.id) {
      const c = await catalogApi.removeFromCart(u.id, productId);
      setItems(c.items);
    } else {
      setItems(prev => prev.filter(i => i.productId !== productId));
    }
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return <Ctx.Provider value={{ items, add, remove, clear, subtotal, count }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be inside CartProvider');
  return c;
}
