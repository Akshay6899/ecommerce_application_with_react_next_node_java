'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { auth } from '@/lib/auth';
import { catalogApi } from '@/lib/api';

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [addr, setAddr] = useState({ line1: '', city: '', state: '', pin: '' });

  useEffect(() => {
    if (!auth.getUser()) router.push('/login');
    if (items.length === 0) router.push('/cart');
  }, [items.length, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = auth.getUser();
    const { orderId } = await catalogApi.createOrder({
      userId: u.id,
      items,
      total: subtotal,
      address: addr
    });
    clear();
    router.push(`/payment?orderId=${orderId}&amount=${subtotal}`);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
      <form className="card" onSubmit={submit}>
        <h2>Shipping Address</h2>
        <label>Address Line</label>
        <input value={addr.line1} onChange={e => setAddr({ ...addr, line1: e.target.value })} required />
        <div className="row" style={{ gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>City</label>
            <input value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })} required />
          </div>
          <div style={{ flex: 1 }}>
            <label>State</label>
            <input value={addr.state} onChange={e => setAddr({ ...addr, state: e.target.value })} required />
          </div>
          <div style={{ width: 120 }}>
            <label>PIN</label>
            <input value={addr.pin} onChange={e => setAddr({ ...addr, pin: e.target.value })} required />
          </div>
        </div>
        <button className="btn-accent" type="submit" style={{ marginTop: 16 }}>Continue to Payment</button>
      </form>
      <aside className="card">
        <h3>Order Summary</h3>
        {items.map(i => (
          <div key={i.productId} className="row between" style={{ fontSize: 14, marginTop: 8 }}>
            <span>{i.title} × {i.qty}</span>
            <span>₹{i.price * i.qty}</span>
          </div>
        ))}
        <hr />
        <div className="row between"><strong>Total</strong><strong>₹{subtotal.toLocaleString()}</strong></div>
      </aside>
    </div>
  );
}
