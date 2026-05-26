'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import { catalogApi } from '@/lib/api';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const u = auth.getUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
    catalogApi.listOrders(u.id).then(setOrders).catch(() => setOrders([]));
  }, [router]);

  if (!user) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <div className="card">
        <h2>Welcome, {user.name || user.email} 👋</h2>
        <p className="muted">{user.email}</p>
      </div>

      <h3 style={{ margin: '24px 0 12px' }}>Your Orders</h3>
      {orders.length === 0 ? <p className="muted">No orders yet.</p> : (
        <div className="grid" style={{ gap: 12 }}>
          {orders.map(o => (
            <div key={o._id} className="card">
              <div className="row between">
                <strong>Order #{o._id.slice(-6)}</strong>
                <span className="price">₹{o.total}</span>
              </div>
              <p className="muted" style={{ fontSize: 13 }}>Status: {o.status} · {new Date(o.createdAt).toLocaleString()}</p>
              <p className="muted" style={{ fontSize: 13 }}>{o.items.length} item(s)</p>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ margin: '24px 0 12px' }}>Account</h3>
      <div className="card">
        <p>Profile · Addresses · Payment Methods · Wishlist · Notifications</p>
        <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>(Extend via Express user routes)</p>
      </div>
    </div>
  );
}
