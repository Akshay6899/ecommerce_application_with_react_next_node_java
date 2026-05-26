'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      const { user, token } = await authApi.signup(form);
      auth.setSession(token, user);
      router.push('/dashboard');
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Create your account</h2>
      <form onSubmit={submit}>
        <label>Name</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <label>Email</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <label>Password (min 6)</label>
        <input type="password" minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        {err && <p style={{ color: 'red', marginTop: 8 }}>{err}</p>}
        <button className="btn-accent" type="submit" style={{ marginTop: 16, width: '100%' }}>Sign Up</button>
      </form>
      <p style={{ marginTop: 12 }} className="muted">Have an account? <Link href="/login">Login</Link></p>
    </div>
  );
}
