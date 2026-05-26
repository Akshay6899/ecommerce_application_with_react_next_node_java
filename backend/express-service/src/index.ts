import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'express-auth' }));
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Centralized error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 400).json({ error: err.message || 'Bad request' });
});

const PORT = Number(process.env.EXPRESS_PORT || 4001);
app.listen(PORT, () => console.log(`✅ Express auth service running on http://localhost:${PORT}`));
