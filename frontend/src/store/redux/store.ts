/**
 * Redux Toolkit store.
 * - cart: managed by Redux (heavy, multi-component, frequently mutating)
 * - orders: cached order list for dashboard
 *
 * Address book + UI prefs live in Zustand (see src/store/zustand/*).
 */
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import cart from './cartSlice';
import orders from './ordersSlice';

export const store = configureStore({
  reducer: { cart, orders },
  middleware: (gDM) => gDM({ serializableCheck: false })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
