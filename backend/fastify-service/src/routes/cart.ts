import { FastifyInstance } from 'fastify';
import { db } from '../db/mongo';

interface CartItem { productId: string; title: string; price: number; qty: number; }

export default async function cartRoutes(app: FastifyInstance) {
  // GET /cart/:userId
  app.get('/cart/:userId', async (req) => {
    const { userId } = req.params as any;
    const cart = await db().collection('carts').findOne({ _id: userId as any });
    return cart || { _id: userId, items: [] };
  });

  // POST /cart/:userId/items   body: { productId, title, price, qty }
  app.post('/cart/:userId/items', async (req) => {
    const { userId } = req.params as any;
    const item = req.body as CartItem;
    const col = db().collection('carts');
    const existing = await col.findOne({ _id: userId as any });
    let items: CartItem[] = existing?.items || [];
    const idx = items.findIndex(i => i.productId === item.productId);
    if (idx >= 0) items[idx].qty += item.qty;
    else items.push(item);
    await col.updateOne({ _id: userId as any }, { $set: { items, updatedAt: new Date() } }, { upsert: true });
    return { _id: userId, items };
  });

  // DELETE /cart/:userId/items/:productId
  app.delete('/cart/:userId/items/:productId', async (req) => {
    const { userId, productId } = req.params as any;
    const col = db().collection('carts');
    const existing = await col.findOne({ _id: userId as any });
    const items = (existing?.items || []).filter((i: CartItem) => i.productId !== productId);
    await col.updateOne({ _id: userId as any }, { $set: { items, updatedAt: new Date() } }, { upsert: true });
    return { _id: userId, items };
  });
}
