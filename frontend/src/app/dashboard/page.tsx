'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { useAppDispatch, useAppSelector } from '@/store/redux/store';
import { fetchOrders, selectOrders } from '@/store/redux/ordersSlice';
import { useAddressStore } from '@/store/zustand/addressStore';

interface Order {
  _id: string;
  total: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | string;
  items: { title: string; qty: number; price: number }[];
  createdAt: string;
  paymentId?: string | null;
  address?: any;
}

type Tab = 'overview' | 'orders' | 'history' | 'analytics' | 'addresses' | 'account';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders) as Order[];
  const addresses = useAddressStore((s) => s.addresses);
  const defaultId = useAddressStore((s) => s.defaultId);
  const setDefault = useAddressStore((s) => s.setDefault);
  const removeAddress = useAddressStore((s) => s.remove);

  useEffect(() => {
    const u = auth.getUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
    dispatch(fetchOrders(u.id));
  }, [router, dispatch]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
    const paid = orders.filter((o) => o.status === 'PAID').length;
    const pending = orders.filter((o) => o.status === 'PENDING').length;
    const itemsBought = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);
    const avgOrder = totalOrders ? Math.round(totalSpent / totalOrders) : 0;
    return { totalOrders, totalSpent, paid, pending, itemsBought, avgOrder };
  }, [orders]);

  const monthly = useMemo(() => {
    const buckets = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.set(d.toLocaleString('en', { month: 'short' }), 0);
    }
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = d.toLocaleString('en', { month: 'short' });
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + o.total);
    });
    const max = Math.max(1, ...Array.from(buckets.values()));
    return Array.from(buckets.entries()).map(([m, v]) => ({ m, v, pct: (v / max) * 100 }));
  }, [orders]);

  const topItems = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) =>
      o.items.forEach((i) => {
        map.set(i.title, (map.get(i.title) || 0) + i.qty * i.price);
      })
    );
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [orders]);

  const history = useMemo(() => {
    const groups = new Map<string, Order[]>();
    orders.forEach((o) => {
      const day = new Date(o.createdAt).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' });
      if (!groups.has(day)) groups.set(day, []);
      groups.get(day)!.push(o);
    });
    return Array.from(groups.entries());
  }, [orders]);

  if (!user) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, marginTop: 16 }}>
      <aside className="card" style={{ height: 'fit-content', position: 'sticky', top: 80 }}>
        <div style={{ textAlign: 'center', padding: '8px 0 12px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)',
            color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700
          }}>
            {(user.name || user.email)[0].toUpperCase()}
          </div>
          <h4 style={{ marginTop: 8 }}>{user.name || user.email.split('@')[0]}</h4>
          <p className="muted" style={{ fontSize: 12 }}>{user.email}</p>
        </div>
        <hr />
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'orders', label: '📦 Orders' },
          { id: 'history', label: '🕒 Order History' },
          { id: 'analytics', label: '📈 Analytics' },
          { id: 'addresses', label: '🏠 Addresses' },
          { id: 'account', label: '👤 Account' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`tab ${tab === t.id ? 'tab-active' : ''}`}
          >
            {t.label}
          </button>
        ))}
        <hr />
        <button className="tab" onClick={() => { auth.logout(); router.push('/'); }} style={{ color: '#c00' }}>
          🚪 Logout
        </button>
      </aside>

      <section>
        {tab === 'overview' && (
          <>
            <h2>Welcome back, {user.name || user.email.split('@')[0]} 👋</h2>
            <p className="muted">Here&apos;s what&apos;s happening with your account.</p>

            <div className="stats">
              <StatCard icon="📦" label="Total Orders" value={stats.totalOrders} color="#2874f0" />
              <StatCard icon="💰" label="Total Spent" value={`₹${stats.totalSpent.toLocaleString()}`} color="#388e3c" />
              <StatCard icon="🛒" label="Items Bought" value={stats.itemsBought} color="#ff9f00" />
              <StatCard icon="⏳" label="Pending" value={stats.pending} color="#d32f2f" />
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="row between">
                <h3>Recent Orders</h3>
                <button className="btn-link" onClick={() => setTab('orders')}>View all →</button>
              </div>
              {orders.length === 0 ? (
                <p className="muted" style={{ marginTop: 12 }}>
                  No orders yet. <Link href="/products" style={{ color: 'var(--primary)' }}>Start shopping →</Link>
                </p>
              ) : (
                <OrdersTable orders={orders.slice(0, 5)} />
              )}
            </div>
          </>
        )}

        {tab === 'orders' && (
          <>
            <h2>All Orders ({orders.length})</h2>
            <p className="muted">Track and manage all your purchases.</p>
            <div className="card" style={{ marginTop: 16 }}>
              {orders.length === 0 ? <p className="muted">No orders yet.</p> : <OrdersTable orders={orders} />}
            </div>
          </>
        )}

        {tab === 'history' && (
          <>
            <h2>Order History</h2>
            <p className="muted">A chronological timeline of every order.</p>
            {history.length === 0 ? <p className="muted" style={{ marginTop: 16 }}>No history yet.</p> : (
              <div style={{ marginTop: 16 }}>
                {history.map(([day, dayOrders]) => (
                  <div key={day} className="card" style={{ marginBottom: 12 }}>
                    <h4 style={{ color: 'var(--primary)' }}>📅 {day}</h4>
                    <hr />
                    {dayOrders.map((o) => (
                      <div key={o._id} style={{ paddingTop: 10 }}>
                        <div className="row between">
                          <strong>Order #{o._id.slice(-6)}</strong>
                          <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                        </div>
                        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                          {o.items.map((i) => `${i.title} × ${i.qty}`).join(' · ')}
                        </p>
                        <div className="row between" style={{ marginTop: 4 }}>
                          <span className="muted" style={{ fontSize: 12 }}>
                            {new Date(o.createdAt).toLocaleTimeString()}
                          </span>
                          <span className="price">₹{o.total.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'analytics' && (
          <>
            <h2>Analytics</h2>
            <p className="muted">Insights from your shopping history.</p>

            <div className="stats" style={{ marginTop: 16 }}>
              <StatCard icon="📊" label="Avg Order Value" value={`₹${stats.avgOrder}`} color="#7b1fa2" />
              <StatCard icon="✅" label="Successful" value={stats.paid} color="#388e3c" />
              <StatCard icon="⏳" label="Pending" value={stats.pending} color="#f57c00" />
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <h3>Spend (last 6 months)</h3>
              <div className="chart">
                {monthly.map((b) => (
                  <div key={b.m} className="bar-wrap">
                    <div className="bar" style={{ height: `${Math.max(4, b.pct)}%` }} title={`₹${b.v}`} />
                    <span className="bar-label">{b.m}</span>
                    <span className="bar-val">₹{b.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <h3>Top Purchases</h3>
              {topItems.length === 0 ? <p className="muted">No data.</p> : (
                <ul style={{ listStyle: 'none', marginTop: 8 }}>
                  {topItems.map(([title, total], i) => (
                    <li key={title} className="row between" style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                      <span><strong>#{i + 1}</strong> &nbsp; {title}</span>
                      <span className="price">₹{total.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {tab === 'addresses' && (
          <>
            <h2>Saved Addresses</h2>
            <p className="muted">Stored in your browser (Zustand + localStorage) for faster checkout.</p>
            <div className="card" style={{ marginTop: 16 }}>
              {addresses.length === 0 ? (
                <p className="muted">
                  No addresses yet — you&apos;ll be asked to enter one at checkout, and it&apos;ll be saved here automatically.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {addresses.map((a) => (
                    <div key={a.id} className="method" style={{ cursor: 'default' }}>
                      <div style={{ flex: 1 }}>
                        <strong>{a.label}</strong>
                        {defaultId === a.id && <span className="badge badge-paid" style={{ marginLeft: 8 }}>Default</span>}
                        <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                          {a.line1}, {a.city}, {a.state} – {a.pin}
                          {a.phone ? ` · ☎ ${a.phone}` : ''}
                        </div>
                      </div>
                      {defaultId !== a.id && (
                        <button className="btn-link" onClick={() => setDefault(a.id)}>Set default</button>
                      )}
                      <button className="btn-link" style={{ color: '#c00' }} onClick={() => removeAddress(a.id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'account' && (
          <>
            <h2>Account Settings</h2>
            <div className="card" style={{ marginTop: 16 }}>
              <h3>Profile</h3>
              <p style={{ marginTop: 8 }}><strong>Name:</strong> {user.name || '—'}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> <code style={{ fontSize: 12 }}>{user.id}</code></p>
            </div>
            <div className="card" style={{ marginTop: 16 }}>
              <h3>Security</h3>
              <p className="muted">
                JWT-based session. Token is stored in browser localStorage and sent as
                <code> Authorization: Bearer …</code> on every API call.
              </p>
            </div>
            <div className="card" style={{ marginTop: 16 }}>
              <h3>State Management</h3>
              <p className="muted">
                Cart &amp; orders → <strong>Redux Toolkit</strong>. Addresses &amp; UI prefs → <strong>Zustand</strong> (persisted).
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: any; color: string }) {
  return (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div>
        <div className="muted" style={{ fontSize: 12 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 12 }}>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td><code>#{o._id.slice(-6)}</code></td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td>{o.items.length} item{o.items.length > 1 ? 's' : ''}</td>
              <td className="price">₹{o.total.toLocaleString()}</td>
              <td><span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
