'use client';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { store } from './store';
import { hydrateCart } from './cartSlice';
import { auth } from '@/lib/auth';

/** Wraps the app in the Redux Provider and re-hydrates the cart whenever auth changes. */
export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(hydrateCart());
    const off = auth.onChange(() => { store.dispatch(hydrateCart()); });
    return off;
  }, []);

  // Mirror cart to localStorage as offline fallback
  useEffect(() => {
    return store.subscribe(() => {
      const items = store.getState().cart.items;
      if (typeof window !== 'undefined') localStorage.setItem('cart', JSON.stringify(items));
    });
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
