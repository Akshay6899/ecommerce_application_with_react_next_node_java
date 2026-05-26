import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev_secret';

export function sign(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}
export function verify<T = any>(token: string): T {
  return jwt.verify(token, SECRET) as T;
}
