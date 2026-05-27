/**
 * Redux Toolkit cart slice.
 *
 * Why Redux here?
 *  - Cart is shared by Navbar (count), Cart page, Checkout, PDP "Buy Now", and Dashboard.
 *  - It mutates often (add/remove/qty) and benefits from time-travel debugging + middleware.
 *  - Server-side cart (Mongo) is synced via thunks; localStorage is the offline fallback.
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { catalogApi, CartItem } from '@/lib/api';
import { auth } from '@/lib/auth';

interface CartState {
  items: CartItem[];
  status: 'idle' | 'loading' | 'error';
  lastSynced: number | null;
}

const initialState: CartState = { items: [], status: 'idle', lastSynced: null };

/** Hydrate cart from server (if logged in) else from localStorage. */
export const hydrateCart = createAsyncThunk('cart/hydrate', async () => {
  const u = auth.getUser();
  if (u?.id) {
    const c = await catalogApi.getCart(u.id);
    return c.items || [];
  }
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('cart');
    return local ? (JSON.parse(local) as CartItem[]) : [];
  }
  return [];
});

export const addItem = createAsyncThunk('cart/add', async (item: CartItem) => {
  const u = auth.getUser();
  if (u?.id) {
    const c = await catalogApi.addToCart(u.id, item);
    return c.items;
  }
  return { __local: item } as any; // handled in reducer
});

export const removeItem = createAsyncThunk('cart/remove', async (productId: string) => {
  const u = auth.getUser();
  if (u?.id) {
    const c = await catalogApi.removeFromCart(u.id, productId);
    return c.items;
  }
  return { __localRemove: productId } as any;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart(state) { state.items = []; },
    setItems(state, action: PayloadAction<CartItem[]>) { state.items = action.payload; },
  },
  extraReducers: (b) => {
    b.addCase(hydrateCart.pending, (s) => { s.status = 'loading'; });
    b.addCase(hydrateCart.fulfilled, (s, a) => {
      s.items = a.payload; s.status = 'idle'; s.lastSynced = Date.now();
    });
    b.addCase(hydrateCart.rejected, (s) => { s.status = 'error'; });
    b.addCase(addItem.fulfilled, (s, a: any) => {
      if (a.payload?.__local) {
        const it = a.payload.__local as CartItem;
        const idx = s.items.findIndex(i => i.productId === it.productId);
        if (idx >= 0) s.items[idx].qty += it.qty;
        else s.items.push(it);
      } else {
        s.items = a.payload;
      }
    });
    b.addCase(removeItem.fulfilled, (s, a: any) => {
      if (a.payload?.__localRemove) {
        s.items = s.items.filter(i => i.productId !== a.payload.__localRemove);
      } else {
        s.items = a.payload;
      }
    });
  }
});

export const { clearCart, setItems } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (s: { cart: CartState }) => s.cart.items;
export const selectCartCount = (s: { cart: CartState }) =>
  s.cart.items.reduce((acc, i) => acc + i.qty, 0);
export const selectCartSubtotal = (s: { cart: CartState }) =>
  s.cart.items.reduce((acc, i) => acc + i.price * i.qty, 0);
