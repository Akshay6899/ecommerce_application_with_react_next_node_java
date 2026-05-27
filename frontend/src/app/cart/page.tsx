'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/redux/store';
import { removeItem, selectCartItems, selectCartSubtotal } from '@/store/redux/cartSlice';

export default function Cart() {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const dispatch = useAppDispatch();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', marginTop: 24 }}>
        <h2>Your cart is empty 🛒</h2>
        <Link href="/products" className="btn" style={{ display: 'inline-block', marginTop: 16 }}>Shop now</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
      <div>
        {items.map(i => (
          <div key={i.productId} className="card" style={{ marginBottom: 12 }}>
            <div className="row between">
              <div>
                <h4>{i.title}</h4>
                <p className="muted">Qty: {i.qty}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="price">₹{(i.price * i.qty).toLocaleString()}</p>
                <button
                  onClick={() => dispatch(removeItem(i.productId))}
                  style={{ background: 'transparent', color: 'red', marginTop: 8 }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="card" style={{ height: 'fit-content', position: 'sticky', top: 80 }}>
        <h3>Price Details</h3>
        <hr />
        <div className="row between"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
        <div className="row between"><span>Delivery</span><span className="price">FREE</span></div>
        <hr />
        <div className="row between"><strong>Total</strong><strong>₹{subtotal.toLocaleString()}</strong></div>
        <button className="btn-accent" style={{ width: '100%', marginTop: 16 }} onClick={() => router.push('/checkout')}>
          Place Order
        </button>
      </aside>
    </div>
  );
}
