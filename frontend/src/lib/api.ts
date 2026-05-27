/**
 * Centralized API client.
 * Each backend service has its own base URL (env-driven).
 * Auth token is read from localStorage and attached to every request.
 */
const AUTH = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:4001';
const CATALOG = process.env.NEXT_PUBLIC_CATALOG_URL || 'http://localhost:4002';
const PAYMENT = process.env.NEXT_PUBLIC_PAYMENT_URL || 'http://localhost:4003';

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function request<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(opts.headers || {})
    },
    cache: 'no-store'
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${msg}`);
  }
  return res.json() as Promise<T>;
}

/* ---------------- Auth (Express) ---------------- */
export const authApi = {
  signup: (b: { email: string; password: string; name?: string }) =>
    request<{ user: any; token: string }>(`${AUTH}/auth/signup`, { method: 'POST', body: JSON.stringify(b) }),
  login: (b: { email: string; password: string }) =>
    request<{ user: any; token: string }>(`${AUTH}/auth/login`, { method: 'POST', body: JSON.stringify(b) }),
  me: () => request<{ user: any }>(`${AUTH}/auth/me`)
};

/* ---------------- Catalog (Fastify) ---------------- */
export const catalogApi = {
  listProducts: (params: { q?: string; category?: string; skip?: number; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.category) qs.set('category', params.category);
    if (params.skip != null) qs.set('skip', String(params.skip));
    if (params.limit != null) qs.set('limit', String(params.limit));
    const url = `${CATALOG}/products${qs.toString() ? `?${qs}` : ''}`;
    return request<{ items: Product[]; total: number; skip: number; limit: number }>(url);
  },
  getProduct: (id: string) => request<Product>(`${CATALOG}/products/${id}`),
  getCart: (userId: string) => request<Cart>(`${CATALOG}/cart/${userId}`),
  addToCart: (userId: string, item: { productId: string; qty: number; price: number; title: string }) =>
    request<Cart>(`${CATALOG}/cart/${userId}/items`, { method: 'POST', body: JSON.stringify(item) }),
  removeFromCart: (userId: string, productId: string) =>
    request<Cart>(`${CATALOG}/cart/${userId}/items/${productId}`, { method: 'DELETE' }),
  createOrder: (b: { userId: string; items: any[]; total: number; address: any }) =>
    request<{ orderId: string }>(`${CATALOG}/orders`, { method: 'POST', body: JSON.stringify(b) }),
  listOrders: (userId: string) => request<any[]>(`${CATALOG}/orders/${userId}`),
  markPaid: (orderId: string, paymentId: string) =>
    request(`${CATALOG}/orders/${orderId}/paid`, { method: 'PATCH', body: JSON.stringify({ paymentId }) })
};

/* ---------------- Payment (Java) ---------------- */
export const paymentApi = {
  createIntent: (b: { orderId: string; amount: number }) =>
    request<{ paymentId: string; clientSecret: string; status: string }>(`${PAYMENT}/payments/intent`, {
      method: 'POST',
      body: JSON.stringify(b)
    }),
  verify: (b: { paymentId: string; signature?: string }) =>
    request<{ paymentId: string; status: string }>(`${PAYMENT}/payments/verify`, {
      method: 'POST',
      body: JSON.stringify(b)
    })
};

/* ---------------- Types ---------------- */
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
}
export interface CartItem {
  productId: string;
  title: string;
  price: number;
  qty: number;
}
export interface Cart {
  _id: string;
  items: CartItem[];
}
