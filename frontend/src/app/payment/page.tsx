'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { paymentApi, catalogApi } from '@/lib/api';
import { auth } from '@/lib/auth';

type Method = 'upi' | 'card' | 'netbanking' | 'cod';

const METHODS: { id: Method; label: string; icon: string; desc: string }[] = [
  { id: 'upi', label: 'UPI', icon: '📲', desc: 'GPay / PhonePe / Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' }
];

export default function Payment() {
  const sp = useSearchParams();
  const router = useRouter();
  const orderId = sp.get('orderId') || '';
  const amount = Number(sp.get('amount') || 0);

  const [paymentId, setPaymentId] = useState('');
  const [status, setStatus] = useState<'init' | 'ready' | 'processing' | 'paid' | 'error'>('init');
  const [method, setMethod] = useState<Method>('upi');
  const [user, setUser] = useState<any>(null);

  // Method-specific fields
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [bank, setBank] = useState('HDFC');

  // Taxes / fees breakdown
  const breakdown = useMemo(() => {
    const subtotal = amount;
    const tax = Math.round(subtotal * 0.05); // 5% GST demo
    const shipping = subtotal > 500 ? 0 : 49;
    const codFee = method === 'cod' ? 25 : 0;
    const total = subtotal + tax + shipping + codFee;
    return { subtotal, tax, shipping, codFee, total };
  }, [amount, method]);

  useEffect(() => {
    const u = auth.getUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
    if (!orderId) { router.push('/'); return; }
    paymentApi.createIntent({ orderId, amount: breakdown.total })
      .then(r => { setPaymentId(r.paymentId); setStatus('ready'); })
      .catch(() => setStatus('error'));
    // we re-create intent only once on mount; in real life would update on method change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = (): string | null => {
    if (method === 'upi' && !/^[\w.-]+@[\w]+$/.test(upiId)) return 'Enter a valid UPI ID (e.g. name@okhdfc).';
    if (method === 'card') {
      if (card.number.replace(/\s/g, '').length < 12) return 'Enter a valid card number.';
      if (!card.name) return 'Cardholder name is required.';
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return 'Expiry must be MM/YY.';
      if (!/^\d{3,4}$/.test(card.cvv)) return 'Invalid CVV.';
    }
    return null;
  };

  const pay = async () => {
    const err = validate();
    if (err) { alert(err); return; }
    setStatus('processing');
    try {
      const r = await paymentApi.verify({ paymentId, signature: `demo-${method}` });
      if (r.status === 'PAID' || method === 'cod') {
        await catalogApi.markPaid(orderId, paymentId);
        setStatus('paid');
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'paid') {
    return (
      <div className="card" style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 64 }}>✅</div>
        <h2 style={{ color: 'var(--green)' }}>Payment Successful!</h2>
        <p className="muted" style={{ marginTop: 8 }}>Order #{orderId.slice(-6)} · ₹{breakdown.total.toLocaleString()}</p>
        <p className="muted" style={{ marginTop: 4 }}>Paid via {METHODS.find(m => m.id === method)?.label}</p>
        <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>Redirecting to your dashboard…</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
      {/* LEFT: Method picker + form */}
      <div className="card">
        <h2>Payment Options</h2>
        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Choose how you'd like to pay.</p>

        <div className="methods" style={{ marginTop: 16 }}>
          {METHODS.map(m => (
            <label key={m.id} className={`method ${method === m.id ? 'active' : ''}`}>
              <input
                type="radio"
                name="method"
                value={m.id}
                checked={method === m.id}
                onChange={() => setMethod(m.id)}
              />
              <span style={{ fontSize: 22 }}>{m.icon}</span>
              <div>
                <strong>{m.label}</strong>
                <div className="muted" style={{ fontSize: 12 }}>{m.desc}</div>
              </div>
            </label>
          ))}
        </div>

        <hr />

        {/* Conditional inputs */}
        {method === 'upi' && (
          <div>
            <label>UPI ID</label>
            <input placeholder="yourname@okhdfc" value={upiId} onChange={e => setUpiId(e.target.value)} />
          </div>
        )}

        {method === 'card' && (
          <div>
            <label>Card Number</label>
            <input placeholder="1234 5678 9012 3456" value={card.number}
              onChange={e => setCard({ ...card, number: e.target.value })} />
            <label>Name on Card</label>
            <input value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} />
            <div className="row" style={{ gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Expiry (MM/YY)</label>
                <input placeholder="12/28" value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label>CVV</label>
                <input type="password" maxLength={4} value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {method === 'netbanking' && (
          <div>
            <label>Choose Bank</label>
            <select value={bank} onChange={e => setBank(e.target.value)}>
              <option>HDFC</option><option>ICICI</option><option>SBI</option>
              <option>Axis</option><option>Kotak</option><option>Yes Bank</option>
            </select>
          </div>
        )}

        {method === 'cod' && (
          <div className="info-box">
            💵 Pay <strong>₹{breakdown.total}</strong> in cash when your order is delivered.
            A small ₹25 handling fee applies.
          </div>
        )}

        {status === 'error' && (
          <p style={{ color: 'red', marginTop: 12 }}>Payment failed. Please try again.</p>
        )}

        <button
          className="btn-accent"
          style={{ width: '100%', marginTop: 20 }}
          onClick={pay}
          disabled={status === 'processing' || status === 'init'}
        >
          {status === 'processing' ? 'Processing…' :
           status === 'init' ? 'Loading…' :
           method === 'cod' ? `Place Order · ₹${breakdown.total}` : `Pay ₹${breakdown.total}`}
        </button>
        <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
          🔒 Secured by ShopKart Pay (Java microservice on :4003).
        </p>
      </div>

      {/* RIGHT: Order summary */}
      <aside className="card">
        <h3>Order Summary</h3>
        <p className="muted" style={{ fontSize: 13 }}>Order #{orderId.slice(-6)}</p>
        <hr />
        <div className="row between"><span>Subtotal</span><span>₹{breakdown.subtotal.toLocaleString()}</span></div>
        <div className="row between" style={{ marginTop: 6 }}>
          <span>GST (5%)</span><span>₹{breakdown.tax}</span>
        </div>
        <div className="row between" style={{ marginTop: 6 }}>
          <span>Shipping</span>
          <span>{breakdown.shipping === 0 ? <em className="price">FREE</em> : `₹${breakdown.shipping}`}</span>
        </div>
        {breakdown.codFee > 0 && (
          <div className="row between" style={{ marginTop: 6 }}>
            <span>COD Handling</span><span>₹{breakdown.codFee}</span>
          </div>
        )}
        <hr />
        <div className="row between">
          <strong>Total Payable</strong>
          <strong className="price" style={{ fontSize: 20 }}>₹{breakdown.total.toLocaleString()}</strong>
        </div>
        {user && (
          <>
            <hr />
            <p style={{ fontSize: 13 }}><strong>Billed to:</strong> {user.name || user.email}</p>
          </>
        )}
      </aside>
    </div>
  );
}
