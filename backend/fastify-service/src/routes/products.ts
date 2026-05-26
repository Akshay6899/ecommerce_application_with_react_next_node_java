import { FastifyInstance } from 'fastify';
import { ObjectId } from 'mongodb';
import { db } from '../db/mongo';

export default async function productRoutes(app: FastifyInstance) {
  // GET /products?q=phone&category=Electronics&limit=20
  app.get('/products', async (req) => {
    const { q, category, limit = 50 } = req.query as any;
    const filter: any = {};
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
    if (category) filter.category = category;
    const items = await db().collection('products').find(filter).limit(Number(limit)).toArray();
    const total = await db().collection('products').countDocuments(filter);
    return { items: items.map(i => ({ ...i, _id: i._id.toString() })), total };
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
