'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/redux/store';
import { selectCartCount } from '@/store/redux/cartSlice';
import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const count = useAppSelector(selectCartCount);
  const [user, setUser] = useState<any>(null);
  const [q, setQ] = useState('');
  const router = useRouter();

  // Re-read the logged-in user whenever auth state changes (login / logout / other tab).
  useEffect(() => {
    const sync = () => setUser(auth.getUser());
    sync();
    return auth.onChange(sync);
  }, []);

  const logout = () => {
    auth.logout();
    router.push('/');
  };
  const search = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/products?q=${encodeURIComponent(q)}`);
  };

  return (
    <nav className="navbar">
      <Link href="/" style={{ fontWeight: 700, fontSize: 20 }}>🛍️ ShopKart</Link>
      <form className="search" onSubmit={search}>
        <input placeholder="Search for products, brands and more" value={q} onChange={e => setQ(e.target.value)} />
      </form>
      <Link href="/products">Browse</Link>
      {user ? (
        <>
          <Link href="/dashboard">Hi, {user.name || user.email.split('@')[0]}</Link>
          <button onClick={logout} className="btn-link">Logout</button>
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
