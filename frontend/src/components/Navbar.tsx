'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { count } = useCart();
  const [user, setUser] = useState<any>(null);
  const [q, setQ] = useState('');
  const router = useRouter();

  useEffect(() => setUser(auth.getUser()), []);

  const logout = () => { auth.logout(); setUser(null); router.push('/'); };
  const search = (e: React.FormEvent) => { e.preventDefault(); router.push(`/products?q=${encodeURIComponent(q)}`); };

  return (
    <nav className="navbar">
      <Link href="/" style={{ fontWeight: 700, fontSize: 20 }}>🛍️ ShopKart</Link>
      <form className="search" onSubmit={search}>
        <input placeholder="Search for products, brands and more" value={q} onChange={e => setQ(e.target.value)} />
      </form>
      <Link href="/products">Browse</Link>
      {user ? (
        <>
          <Link href="/dashboard">Hi, {user.name || user.email}</Link>
          <button onClick={logout} style={{ background: 'transparent', color: '#fff' }}>Logout</button>
        </>
      ) : (
        <>
          <Link href="/login">Login</Link>
          <Link href="/signup">Signup</Link>
        </>
      )}
      <Link href="/cart">🛒 Cart ({count})</Link>
    </nav>
  );
}
