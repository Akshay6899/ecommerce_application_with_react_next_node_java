/**
 * Zustand store for saved shipping addresses + payment preferences.
 *
 * Why Zustand here?
 *  - Small, isolated slice of state (just a list of saved addresses + selected id).
 *  - Lives in the browser (persisted to localStorage), no need for thunks/middleware.
 *  - Used only by Checkout & Payment pages — Redux would be overkill.
 *
 * Persisted under the localStorage key `shopkart-addresses`.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Address {
  id: string;
  label: string;        // "Home", "Office"
  line1: string;
  city: string;
  state: string;
  pin: string;
  phone?: string;
}

interface AddressState {
  addresses: Address[];
  defaultId: string | null;
  add: (a: Omit<Address, 'id'>) => Address;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
  getDefault: () => Address | undefined;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      defaultId: null,
      add: (a) => {
        const next: Address = { ...a, id: `addr_${Date.now()}` };
        set((s) => ({
          addresses: [...s.addresses, next],
          defaultId: s.defaultId ?? next.id
        }));
        return next;
      },
      remove: (id) =>
        set((s) => ({
          addresses: s.addresses.filter((a) => a.id !== id),
          defaultId: s.defaultId === id ? null : s.defaultId
        })),
      setDefault: (id) => set({ defaultId: id }),
      getDefault: () => {
        const { addresses, defaultId } = get();
        return addresses.find((a) => a.id === defaultId) || addresses[0];
      }
    }),
    { name: 'shopkart-addresses' }
  )
);
