/** Redux slice for caching the logged-in user's orders (dashboard). */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { catalogApi } from '@/lib/api';

interface OrdersState { items: any[]; status: 'idle' | 'loading' | 'error'; }
const initialState: OrdersState = { items: [], status: 'idle' };

export const fetchOrders = createAsyncThunk('orders/fetch', async (userId: string) => {
  return await catalogApi.listOrders(userId);
});

const slice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrders(s) { s.items = []; }
  },
  extraReducers: (b) => {
    b.addCase(fetchOrders.pending, (s) => { s.status = 'loading'; });
    b.addCase(fetchOrders.fulfilled, (s, a) => { s.items = a.payload as any[]; s.status = 'idle'; });
    b.addCase(fetchOrders.rejected, (s) => { s.status = 'error'; });
  }
});

export const { clearOrders } = slice.actions;
export default slice.reducer;
export const selectOrders = (s: { orders: OrdersState }) => s.orders.items;
