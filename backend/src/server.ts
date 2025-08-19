// filepath: gemini-ai-search-app/backend/src/server.ts

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

import { configureSearchRoutes } from './routes/searchRoutes';
import { fetchAndProcessGeminiResults } from './geminiService';
import { extractBestRecipe } from './cocktail';
import { getShooterFromLiquor } from './shooters';
import { isFoodItem, isLiquorType } from '../../shared/constants';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: '10mb' }));

async function startServer() {
  // 1. Validate env
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('FATAL ERROR: GEMINI_API_KEY is not defined.');
    process.exit(1);
  }


  // 2. Initialize Firebase Admin SDK
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log('✅ Initialized Firebase Admin SDK');
  }
  const db = getFirestore();

  // 3. Mount your main API router
  app.use('/api', configureSearchRoutes(db, GEMINI_API_KEY));

  // 4. Quick GET /api/search for spot-testing
  type Query = { q?: string | string[] };
  app.get(
    '/api/search',
    async (req: Request<{}, {}, {}, Query>, res: Response) => {
      try {
        // Normalize q param into a single trimmed string
        const raw = req.query.q;
        let queryStr = '';
        if (Array.isArray(raw)) {
          queryStr = raw[0];
        } else if (typeof raw === 'string') {
          queryStr = raw;
        }
        queryStr = queryStr.trim();
        if (!queryStr) {
          return res
            .status(400)
            .json({ error: 'Query parameter "q" is required.' });
        }

        const normalized = queryStr.toLowerCase();

        // Call the Gemini fetch + cocktail logic
        const apiResults = await fetchAndProcessGeminiResults(
          queryStr,
          GEMINI_API_KEY
        );
        const bestRecipe = extractBestRecipe(apiResults);

        // Try shooter logic
        let shooterRecipe: { name: string; ingredients: string[] } | null =
          null;
        try {
          const s = await getShooterFromLiquor(normalized);
          if (s?.name && s?.ingredients) {
            shooterRecipe = { name: s.name, ingredients: s.ingredients };
          }
        } catch {
          /* ignore */
        }

        const food = isFoodItem(normalized);
        const liquor = isLiquorType(normalized);

        if (food) {
          return res.json({ results: apiResults, formattedRecipe: null });
        }

        // For liquor types or cocktail names
        return res.json({
          results: liquor ? [] : apiResults,
          formattedRecipe: bestRecipe,
          shooterRecipe,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return res.status(500).json({ error: msg });
      }
    }
  );

  // 5. Serve frontend in prod or when flagged
  // SIMPLIFIED: Frontend is now built directly into backend/dist/frontend
  // Compiled server is at: backend/dist/backend/src/server.js
  // Frontend is at: backend/dist/frontend/
  // So we go up 2 levels: ../../frontend
  const distPath = path.resolve(__dirname, '../../frontend');
  
  const serveFrontend =
    process.env.NODE_ENV === 'production' ||
    process.env.SERVE_FRONTEND === 'true';

  if (serveFrontend) {
    // Debug logging
    console.log(`🔍 Current directory: ${__dirname}`);
    console.log(`🔍 Looking for frontend at: ${distPath}`);
    console.log(`📁 index.html exists: ${fs.existsSync(path.join(distPath, 'index.html'))}`);
    
    if (fs.existsSync(path.join(distPath, 'index.html'))) {
      console.log(`📂 Serving frontend from ${distPath}`);
      app.use(express.static(distPath));

      // Only fallback for non-API GETs
      app.get(/^(?!\/api).*/, (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.warn(`⚠️ Frontend dist not found at ${distPath}`);
      console.warn('   Make sure to build the frontend first with: npm run build:frontend');
    }
  } else {
    console.log('ℹ️ Frontend serving disabled (set SERVE_FRONTEND=true to enable)');
  }

  // 6. Start server
  app.listen(PORT, () =>
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
  );
}

startServer();