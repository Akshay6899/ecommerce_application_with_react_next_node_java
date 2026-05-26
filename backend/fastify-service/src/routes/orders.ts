import { FastifyInstance } from 'fastify';
import { ObjectId } from 'mongodb';
import { db } from '../db/mongo';

export default async function orderRoutes(app: FastifyInstance) {
  // POST /orders
  app.post('/orders', async (req) => {
    const body = req.body as any;
    const order = {
      userId: body.userId,
      items: body.items,
      total: body.total,
      address: body.address,
      status: 'PENDING',
      paymentId: null as string | null,
      createdAt: new Date()
    };
    const r = await db().collection('orders').insertOne(order);
    // Clear the user's cart on order creation
    await db().collection('carts').updateOne({ _id: body.userId }, { $set: { items: [] } });
    return { orderId: r.insertedId.toString() };
  });

  // GET /orders/:userId
  app.get('/orders/:userId', async (req) => {
    const { userId } = req.params as any;
    const orders = await db().collection('orders').find({ userId }).sort({ createdAt: -1 }).toArray();
    return orders.map(o => ({ ...o, _id: o._id.toString() }));
  });

  // PATCH /orders/:id/paid   body: { paymentId }
  app.patch('/orders/:id/paid', async (req, reply) => {
    const { id } = req.params as any;
    const { paymentId } = req.body as any;
    if (!ObjectId.isValid(id)) return reply.code(400).send({ error: 'Bad id' });
    await db().collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'PAID', paymentId, paidAt: new Date() } }
    );
    return { ok: true };
  });
}
