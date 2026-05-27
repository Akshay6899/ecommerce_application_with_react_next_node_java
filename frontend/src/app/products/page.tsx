'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { catalogApi, Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useDebounce, useThrottle } from '@/lib/hooks';

const PAGE_SIZE = 12;
type Mode = 'pagination' | 'infinite';

export default function PLP() {
  const sp = useSearchParams();
  // The navbar search bar pushes ?q= — we debounce it here so rapid URL changes
  // (e.g. from a future inline search) don't hammer the API.
  const rawQ = sp.get('q') || '';
  const debouncedSearch = useDebounce(rawQ, 400);
  const [cat, setCat] = useState('');
  const [mode, setMode] = useState<Mode>('pagination');

  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);          // 1-based for pagination
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /* ---- Fetch ---- */
  const fetchPage = useCallback(
    async (opts: { page: number; append: boolean }) => {
      setLoading(true);
      try {
        const skip = (opts.page - 1) * PAGE_SIZE;
        const r = await catalogApi.listProducts({
          q: debouncedSearch || undefined,
          category: cat || undefined,
          skip,
          limit: PAGE_SIZE
        });
        setTotal(r.total);
        setHasMore(skip + r.items.length < r.total);
        setItems((prev) => (opts.append ? [...prev, ...r.items] : r.items));
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearch, cat]
  );

  // Reset on search / category / mode change
  useEffect(() => {
    setPage(1);
    fetchPage({ page: 1, append: false });
  }, [debouncedSearch, cat, mode, fetchPage]);

  /* ---- Infinite scroll (throttled) ---- */
  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;
  const pageRef = useRef(page);
  pageRef.current = page;

  const onScroll = useThrottle(() => {
    if (mode !== 'infinite') return;
    if (loadingRef.current || !hasMoreRef.current) return;
    const nearBottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 600;
    if (nearBottom) {
      const next = pageRef.current + 1;
      setPage(next);
      fetchPage({ page: next, append: true });
    }
  }, 250);

  useEffect(() => {
    if (mode !== 'infinite') return;
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mode, onScroll]);

  /* ---- Pagination controls ---- */
  const goToPage = (n: number) => {
    if (n < 1 || n > totalPages) return;
    setPage(n);
    fetchPage({ page: n, append: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, marginTop: 16 }}>
      {/* FILTERS */}
      <aside className="card" style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
        <h3>Filters</h3>
        <label>Category</label>
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label>View</label>
        <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
          <option value="pagination">Pagination</option>
          <option value="infinite">Infinite Scroll (throttled)</option>
        </select>
      </aside>

      {/* RESULTS */}
      <section>
        <div className="row between">
          <h2>
            {rawQ ? `Results for "${rawQ}"` : 'All Products'}{' '}
            <span className="muted" style={{ fontWeight: 400, fontSize: 14 }}>({total})</span>
          </h2>
          {loading && <span className="muted" style={{ fontSize: 13 }}>Loading…</span>}
        </div>

        {items.length === 0 && !loading ? (
          <p className="muted" style={{ marginTop: 16 }}>No products match your filters.</p>
        ) : (
          <div className="grid grid-4" style={{ marginTop: 16 }}>
            {items.map((p) => <ProductCard key={p._id} p={p} />)}
          </div>
        )}

        {/* Pagination controls */}
        {mode === 'pagination' && totalPages > 1 && (
          <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 24 }}>
            <button className="btn-link" disabled={page === 1} onClick={() => goToPage(page - 1)}>← Prev</button>
            {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  onClick={() => goToPage(n)}
                  className={`page-btn ${n === page ? 'page-active' : ''}`}
                >
                  {n}
                </button>
              );
            })}
            {totalPages > 7 && <span className="muted">…</span>}
            <button className="btn-link" disabled={page === totalPages} onClick={() => goToPage(page + 1)}>Next →</button>
          </div>
        )}

        {/* Infinite-scroll footer */}
        {mode === 'infinite' && !hasMore && items.length > 0 && (
          <p className="muted" style={{ textAlign: 'center', marginTop: 24 }}>
            You've reached the end · {items.length} of {total}
          </p>
        )}
      </section>
    </div>
  );
}
