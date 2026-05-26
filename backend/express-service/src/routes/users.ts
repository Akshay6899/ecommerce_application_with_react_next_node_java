import { Router } from 'express';
import { prisma } from '../db/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, email: true, name: true, addresses: true }
    });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (e) { next(e); }
});

router.patch('/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    const { name } = req.body;
    const u = await prisma.user.update({ where: { id: req.params.id }, data: { name } });
    res.json({ id: u.id, email: u.email, name: u.name });
  } catch (e) { next(e); }
});

router.post('/:id/addresses', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    const { line1, city, state, pin } = req.body;
    const a = await prisma.address.create({ data: { userId: req.params.id, line1, city, state, pin } });
    res.json(a);
  } catch (e) { next(e); }
});

export default router;
