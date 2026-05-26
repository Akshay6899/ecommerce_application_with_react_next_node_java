import Link from 'next/link';
import { Product } from '@/lib/api';

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/products/${p._id}`} className="card" style={{ display: 'block' }}>
      <img src={p.image} alt={p.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 4 }} />
      <h3 style={{ fontSize: 16, margin: '12px 0 4px' }}>{p.title}</h3>
      <p className="muted" style={{ fontSize: 13 }}>{p.category}</p>
      <div className="row between" style={{ marginTop: 8 }}>
        <span className="price">₹{p.price.toLocaleString()}</span>
        <span className="muted">★ {p.rating}</span>
      </div>
    </Link>
  );
}
