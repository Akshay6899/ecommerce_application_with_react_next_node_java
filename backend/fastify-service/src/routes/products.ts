import { FastifyInstance } from 'fastify';
import { ObjectId } from 'mongodb';
import { db } from '../db/mongo';

export default async function productRoutes(app: FastifyInstance) {
  // GET /products?q=phone&category=Electronics&limit=20&skip=0
  app.get('/products', async (req) => {
    const { q, category, limit = 20, skip = 0 } = req.query as any;
    const filter: any = {};
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
    if (category) filter.category = category;
    const lim = Math.min(Number(limit) || 20, 100);
    const sk = Math.max(Number(skip) || 0, 0);
    const col = db().collection('products');
    const [items, total] = await Promise.all([
      col.find(filter).skip(sk).limit(lim).toArray(),
      col.countDocuments(filter)
    ]);
    return {
      items: items.map(i => ({ ...i, _id: i._id.toString() })),
      total,
      skip: sk,
      limit: lim
    };
  });

  // GET /products/:id
  app.get('/products/:id', async (req, reply) => {
    const { id } = req.params as any;
    if (!ObjectId.isValid(id)) return reply.code(400).send({ error: 'Bad id' });
    const p = await db().collection('products').findOne({ _id: new ObjectId(id) });
    if (!p) return reply.code(404).send({ error: 'Not found' });
    return { ...p, _id: p._id.toString() };
  });
}
