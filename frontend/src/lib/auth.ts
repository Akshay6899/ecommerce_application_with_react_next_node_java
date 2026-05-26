/** Local auth helpers (token + user persisted to localStorage). */
export const auth = {
  setSession(token: string, user: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
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
  logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
