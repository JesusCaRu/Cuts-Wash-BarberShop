import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

import { authenticateToken } from './server/middleware/auth.js';
import authRoutes from './server/routes/auth.js';
import usersRoutes from './server/routes/users.js';
import servicesRoutes from './server/routes/services.js';
import stylistsRoutes from './server/routes/stylists.js';
import appointmentsRoutes from './server/routes/appointments.js';
import calendarRoutes from './server/routes/calendar.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Global Error Handlers to prevent server crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use(authenticateToken);

  // Mount API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/stylists', stylistsRoutes);
  app.use('/api/appointments', appointmentsRoutes);
  app.use('/api/calendar', calendarRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
