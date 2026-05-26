'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { paymentApi, catalogApi } from '@/lib/api';

export default function Payment() {
  const sp = useSearchParams();
  const router = useRouter();
  const orderId = sp.get('orderId') || '';
  const amount = Number(sp.get('amount') || 0);
  const [paymentId, setPaymentId] = useState('');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!orderId) router.push('/');
    paymentApi.createIntent({ orderId, amount })
      .then(r => { setPaymentId(r.paymentId); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, [orderId, amount, router]);

  const pay = async () => {
    setStatus('processing');
    try {
      const r = await paymentApi.verify({ paymentId, signature: 'demo-sig' });
      if (r.status === 'PAID') {
        await catalogApi.markPaid(orderId, paymentId);
        setStatus('paid');
        setTimeout(() => router.push('/dashboard'), 1500);
      }
    } catch { setStatus('error'); }
  };

  return (
    <div className="card" style={{ maxWidth: 480, margin: '40px auto' }}>
      <h2>Payment</h2>
      <p className="muted">Order: {orderId}</p>
      <h1 className="price" style={{ margin: '16px 0' }}>₹{amount.toLocaleString()}</h1>

      <h4>Choose payment method</h4>
      <select defaultValue="upi">
        <option value="upi">UPI</option>
        <option value="card">Credit / Debit Card</option>
        <option value="cod">Cash on Delivery</option>
        <option value="netbanking">Net Banking</option>
      </select>

      <button className="btn-accent" style={{ width: '100%', marginTop: 16 }} onClick={pay} disabled={status !== 'ready'}>
        {status === 'processing' ? 'Processing…' :
         status === 'paid' ? '✅ Paid! Redirecting…' :
         status === 'error' ? 'Retry' : `Pay ₹${amount}`}
      </button>
      <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>(Demo: payment is auto-approved by the Java service.)</p>
    </div>
  );
}
