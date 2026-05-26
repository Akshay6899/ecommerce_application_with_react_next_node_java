import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { connectMongo } from './db/mongo';
import { seedIfEmpty } from './seed';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';

async function main() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });

  app.get('/health', async () => ({ status: 'ok', service: 'fastify-catalog' }));
  await app.register(productRoutes);
  await app.register(cartRoutes);
  await app.register(orderRoutes);

  await connectMongo();
  await seedIfEmpty();

  const port = Number(process.env.FASTIFY_PORT || 4002);
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`✅ Fastify catalog service running on http://localhost:${port}`);
}

main().catch(err => { console.error(err); process.exit(1); });
