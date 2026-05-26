'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { catalogApi, Product } from '@/lib/api';
import { useCart } from '@/context/CartContext';

export default function PDP() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const router = useRouter();

  useEffect(() => { catalogApi.getProduct(id).then(setP).catch(() => setP(null)); }, [id]);
  const totalPrice = useMemo(() => (p ? p.price * qty : 0), [p, qty]);

  if (!p) return <p style={{ marginTop: 16 }}>Loading product…</p>;

  const addToCart = async () => {
    await add({ productId: p._id, title: p.title, price: p.price, qty });
    alert('Added to cart!');
  };
  const buyNow = async () => { await addToCart(); router.push('/checkout'); };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 16 }}>
      <div className="card">
        <img src={p.image} alt={p.title} style={{ width: '100%', maxHeight: 460, objectFit: 'contain' }} />
        <div className="row" style={{ marginTop: 16, gap: 12 }}>
          <button className="btn-accent" style={{ flex: 1 }} onClick={addToCart}>🛒 Add to Cart</button>
          <button className="btn" style={{ flex: 1 }} onClick={buyNow}>⚡ Buy Now</button>
        </div>
      </div>
      <div>
        <h1>{p.title}</h1>
        <p className="muted">{p.category}</p>
        <p style={{ margin: '8px 0' }}>★ {p.rating} · In stock: {p.stock}</p>
        <h2 className="price" style={{ fontSize: 32, margin: '12px 0' }}>₹{p.price.toLocaleString()}</h2>
        <p style={{ margin: '8px 0' }}><strong>Total for selected quantity:</strong> ₹{totalPrice.toLocaleString()}</p>
        <p>{p.description}</p>
        <hr />
        <label>Quantity</label>
        <select value={qty} onChange={e => setQty(+e.target.value)} style={{ width: 120 }}>
          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <h3 style={{ marginTop: 24 }}>Highlights</h3>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>Free delivery</li>
          <li>7-day replacement policy</li>
          <li>1-year manufacturer warranty</li>
        </ul>

        <h3 style={{ marginTop: 24 }}>Ratings & Reviews</h3>
        <div className="card" style={{ marginTop: 8 }}>
          <strong>★★★★☆ — Great product</strong>
          <p className="muted">Worked well out of the box. Recommended.</p>
        </div>
      </div>
    </div>
  );
}
