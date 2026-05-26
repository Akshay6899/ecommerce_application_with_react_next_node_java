'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      const { user, token } = await authApi.login({ email, password });
      auth.setSession(token, user);
      router.push('/dashboard');
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        {err && <p style={{ color: 'red', marginTop: 8 }}>{err}</p>}
        <button className="btn" type="submit" style={{ marginTop: 16, width: '100%' }}>Login</button>
      </form>
      <p style={{ marginTop: 12 }} className="muted">No account? <Link href="/signup">Sign up</Link></p>
    </div>
  );
}
