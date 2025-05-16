// filepath: gemini-ai-search-app/backend/src/server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { configureSearchRoutes } from './routes/searchRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
    origin: frontendURL
}));

app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'cocktailAppCache';

if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in .env file.");
}

async function startServer() {
    try {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        console.log(`Successfully connected to MongoDB: ${DB_NAME}`);

        // Configure and use routes
        const searchRouter = configureSearchRoutes(db, GEMINI_API_KEY || '');
        app.use('/api', searchRouter);

        app.listen(PORT, () => {
            console.log(`Backend server is running on http://localhost:${PORT}`);
            if (GEMINI_API_KEY) {
                console.log("Gemini API Key loaded.");
            } else {
                console.warn("Gemini API Key is MISSING. The /api/search endpoint will not work correctly.");
            }
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1);
    }
}

startServer();