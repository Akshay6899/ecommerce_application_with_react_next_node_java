'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { catalogApi, Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function PLP() {
  const sp = useSearchParams();
  const q = sp.get('q') || '';
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('');

  useEffect(() => {
    setLoading(true);
    catalogApi.listProducts(q).then(r => setItems(r.items)).finally(() => setLoading(false));
  }, [q]);

  const categories = Array.from(new Set(items.map(i => i.category)));
  const filtered = cat ? items.filter(i => i.category === cat) : items;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, marginTop: 16 }}>
      <aside className="card">
        <h3>Filters</h3>
        <label>Category</label>
        <select value={cat} onChange={e => setCat(e.target.value)}>
          <option value="">All</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </aside>
      <section>
        <h2>{q ? `Results for "${q}"` : 'All Products'} ({filtered.length})</h2>
        {loading ? <p>Loading…</p> : (
          <div className="grid grid-4" style={{ marginTop: 16 }}>
            {filtered.map(p => <ProductCard key={p._id} p={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
