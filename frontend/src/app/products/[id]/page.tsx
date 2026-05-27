'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { catalogApi, paymentApi, Product } from '@/lib/api';
import { useAppDispatch } from '@/store/redux/store';
import { addItem, clearCart } from '@/store/redux/cartSlice';
import { useAddressStore } from '@/store/zustand/addressStore';
import { useUiStore } from '@/store/zustand/uiStore';
import { auth } from '@/lib/auth';

export default function PDP() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const getDefaultAddress = useAddressStore((s) => s.getDefault);
  const pushRecent = useUiStore((s) => s.pushRecent);

  useEffect(() => {
    catalogApi.getProduct(id).then((prod) => {
      setP(prod);
      if (prod?._id) pushRecent(prod._id);
    }).catch(() => setP(null));
  }, [id, pushRecent]);

  const totalPrice = useMemo(() => (p ? p.price * qty : 0), [p, qty]);

  if (!p) return <p style={{ marginTop: 16 }}>Loading product…</p>;

  const addToCart = async () => {
    await dispatch(addItem({ productId: p._id, title: p.title, price: p.price, qty })).unwrap();
  };

  /**
   * Buy Now → creates an order using the user's default saved address
   * and routes straight to the payment page (Next.js client navigation).
   * If no address exists, falls back to /checkout where the user can save one.
   */
  const buyNow = async () => {
    const u = auth.getUser();
    if (!u) { router.push('/login'); return; }
    const addr = getDefaultAddress();
    if (!addr) {
      // Stash the item, then go collect an address.
      await addToCart();
      router.push('/checkout');
      return;
    }
    const total = p.price * qty;
    try {
      const { orderId } = await catalogApi.createOrder({
        userId: u.id,
        items: [{ productId: p._id, title: p.title, price: p.price, qty }],
        total,
        address: addr
      });
      // "Buy Now" creates a single-item order; we don't pollute the cart.
      dispatch(clearCart());
      router.push(`/payment?orderId=${orderId}&amount=${total}`);
    } catch (e: any) {
      alert('Could not create order: ' + e.message);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 16 }}>
      <div className="card">
        <img src={p.image} alt={p.title} style={{ width: '100%', maxHeight: 460, objectFit: 'contain' }} />
        <div className="row" style={{ marginTop: 16, gap: 12 }}>
          <button className="btn-accent" style={{ flex: 1 }} onClick={async () => { await addToCart(); alert('Added to cart!'); }}>
            🛒 Add to Cart
          </button>
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
        <select value={qty} onChange={(e) => setQty(+e.target.value)} style={{ width: 120 }}>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
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
