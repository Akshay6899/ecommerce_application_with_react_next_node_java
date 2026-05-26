import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { sign } from '../utils/jwt';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

router.post('/signup', async (req, res, next) => {
  try {
    const data = signupSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { email: data.email, password: hashed, name: data.name },
      select: { id: true, email: true, name: true }
    });
    const token = sign({ id: user.id, email: user.email });
    res.json({ user, token });
  } catch (e) { next(e); }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = sign({ id: user.id, email: user.email });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (e) { next(e); }
});

router.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, addresses: true }
    });
    res.json({ user });
  } catch (e) { next(e); }
});

export default router;
