'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/redux/store';
import { clearCart, selectCartItems, selectCartSubtotal } from '@/store/redux/cartSlice';
import { useAddressStore } from '@/store/zustand/addressStore';
import { auth } from '@/lib/auth';
import { catalogApi } from '@/lib/api';

export default function Checkout() {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const addresses = useAddressStore((s) => s.addresses);
  const defaultId = useAddressStore((s) => s.defaultId);
  const addAddress = useAddressStore((s) => s.add);
  const removeAddress = useAddressStore((s) => s.remove);
  const setDefault = useAddressStore((s) => s.setDefault);

  const [selectedId, setSelectedId] = useState<string | null>(defaultId);
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [form, setForm] = useState({ label: 'Home', line1: '', city: '', state: '', pin: '', phone: '' });

  useEffect(() => {
    if (!auth.getUser()) router.push('/login');
    if (items.length === 0) router.push('/cart');
  }, [items.length, router]);

  useEffect(() => {
    setSelectedId(defaultId);
  }, [defaultId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = auth.getUser();
    if (!u) return;

    // Resolve address: use selected saved one, otherwise save the new form first.
    let address = addresses.find((a) => a.id === selectedId);
    if (!address) {
      if (!form.line1 || !form.city || !form.pin) {
        alert('Please fill in an address');
        return;
      }
      address = addAddress(form); // ← persisted to localStorage by zustand
    }

    const { orderId } = await catalogApi.createOrder({
      userId: u.id,
      items,
      total: subtotal,
      address
    });
    dispatch(clearCart());
    router.push(`/payment?orderId=${orderId}&amount=${subtotal}`);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
      <form className="card" onSubmit={submit}>
        <div className="row between">
          <h2>Shipping Address</h2>
          {addresses.length > 0 && (
            <button type="button" className="btn-link" onClick={() => setShowForm((v) => !v)}>
              {showForm ? '← Use saved' : '+ Add new'}
            </button>
          )}
        </div>

        {/* Saved addresses (Zustand-persisted) */}
        {!showForm && addresses.length > 0 && (
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {addresses.map((a) => (
              <label key={a.id} className={`method ${selectedId === a.id ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="addr"
                  checked={selectedId === a.id}
                  onChange={() => { setSelectedId(a.id); setDefault(a.id); }}
                />
                <div style={{ flex: 1 }}>
                  <strong>{a.label}</strong>
                  {defaultId === a.id && <span className="badge badge-paid" style={{ marginLeft: 8 }}>Default</span>}
                  <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                    {a.line1}, {a.city}, {a.state} – {a.pin}
                    {a.phone ? ` · ☎ ${a.phone}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-link"
                  style={{ color: '#c00' }}
                  onClick={(e) => { e.preventDefault(); removeAddress(a.id); }}
                >
                  Remove
                </button>
              </label>
            ))}
          </div>
        )}

        {/* New address form */}
        {showForm && (
          <>
            <label>Label</label>
            <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}>
              <option>Home</option><option>Office</option><option>Other</option>
            </select>
            <label>Address Line</label>
            <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
            <div className="row" style={{ gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>City</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </div>
              <div style={{ flex: 1 }}>
                <label>State</label>
                <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
              </div>
              <div style={{ width: 120 }}>
                <label>PIN</label>
                <input value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} required />
              </div>
            </div>
            <label>Phone (optional)</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              💡 This address will be saved locally for future orders.
            </p>
          </>
        )}

        <button className="btn-accent" type="submit" style={{ marginTop: 16 }}>
          Continue to Payment →
        </button>
      </form>

      <aside className="card">
        <h3>Order Summary</h3>
        {items.map((i) => (
          <div key={i.productId} className="row between" style={{ fontSize: 14, marginTop: 8 }}>
            <span>{i.title} × {i.qty}</span>
            <span>₹{i.price * i.qty}</span>
          </div>
        ))}
        <hr />
        <div className="row between">
          <strong>Total</strong>
          <strong>₹{subtotal.toLocaleString()}</strong>
        </div>
      </aside>
    </div>
  );
}
