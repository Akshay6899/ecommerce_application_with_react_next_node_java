'use client';
import { useEffect, useState } from 'react';
import { catalogApi, Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogApi.listProducts({ limit: 8 })
      .then(r => setProducts(r.items))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="card" style={{ marginTop: 16, padding: 40, textAlign: 'center', background: 'linear-gradient(135deg,#2874f0,#1c5dd9)', color: '#fff' }}>
        <h1 style={{ fontSize: 32 }}>Mega Sale is Live 🎉</h1>
        <p>Up to 80% off on Electronics, Fashion, Home & more</p>
      </section>

      <h2 style={{ margin: '24px 0 12px' }}>Featured Products</h2>
      {loading ? <p>Loading…</p> : (
        <div className="grid grid-4">
          {products.map(p => <ProductCard key={p._id} p={p} />)}
        </div>
      )}
    </>
  );
}
