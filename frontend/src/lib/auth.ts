/**
 * Local auth helpers.
 *
 * Where is the login data stored?
 *   - In the browser's `localStorage` under the keys `token` and `user`.
 *   - You can inspect it in DevTools → Application → Local Storage → http://localhost:3030
 *   - The JWT (issued by the Express service, signed with HS256 + JWT_SECRET) is sent
 *     to APIs via the `Authorization: Bearer <token>` header (see `src/lib/api.ts`).
 *
 * The custom `auth-change` event lets the Navbar / other components re-render
 * immediately after login or logout (localStorage changes don't auto-trigger
 * React re-renders in the same tab).
 */
const AUTH_EVENT = 'auth-change';

export const auth = {
  setSession(token: string, user: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new Event(AUTH_EVENT));
  },
  getUser(): any | null {
    if (typeof window === 'undefined') return null;
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },
  isLoggedIn(): boolean {
    return !!auth.getToken();
  },
  logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event(AUTH_EVENT));
  },
  onChange(cb: () => void) {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(AUTH_EVENT, cb);
    window.addEventListener('storage', cb); // cross-tab sync
    return () => {
      window.removeEventListener(AUTH_EVENT, cb);
      window.removeEventListener('storage', cb);
    };
  }
};
