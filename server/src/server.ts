// Process entry point: connect to MongoDB, then start listening.
import { config } from './config/env';
import { app } from './app';
import { connectDb, disconnectDb } from './config/db';

async function start(): Promise<void> {
  await connectDb(config.mongoUri);
  console.log('MongoDB connected');
  const server = app.listen(config.port, () => {
    console.log(`API on http://localhost:${config.port}  |  docs: /api/docs`);
  });

  // Graceful shutdown (Render/Railway send SIGTERM on redeploy).
  const shutdown = () => {
    server.close(() => {
      void disconnectDb().then(() => process.exit(0));
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err: unknown) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
