import { Express } from 'express';
import http from 'http';
import storesRouter from './stores';

export async function registerRoutes(app: Express): Promise<http.Server> {
  // Register API routes
  app.use('/api/stores', storesRouter);

  // Create HTTP server
  const server = http.createServer(app);

  return server;
}