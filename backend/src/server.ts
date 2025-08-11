// filepath: backend/src/server.ts

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: '10mb' }));

async function startServer() {
  console.log('🚀 Starting server...');

  // Basic API endpoint for testing
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Serve frontend in production
  const distPath = path.join(process.cwd(), '..', '..', 'frontend', 'dist');
  console.log('DEBUG: Resolved distPath:', distPath);
  console.log('DEBUG: process.cwd():', process.cwd());
  console.log('DEBUG: Does dist path exist?', fs.existsSync(distPath));
  console.log('DEBUG: Does index.html exist?', fs.existsSync(path.join(distPath, 'index.html')));
  
  const serveFrontend = process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === 'true';

  if (serveFrontend && fs.existsSync(path.join(distPath, 'index.html'))) {
    console.log(`📂 Serving frontend from ${distPath}`);
    app.use(express.static(distPath));

    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.warn('⚠️ Frontend dist not found or SERVE_FRONTEND not enabled.');
  }

  app.listen(PORT, () =>
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
  );
}

startServer().catch(console.error);