// filepath: gemini-ai-search-app/backend/src/server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { configureSearchRoutes } from './routes/searchRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
    origin: frontendURL
}));

// Serve frontend static files in production
import path from 'path';
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === 'true') {
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}

app.use(express.json({ limit: '10mb' }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'cocktailAppCache';

if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in .env file.");
}
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
    console.warn("WARNING: MONGODB_URI is not set. Defaulting to localhost. This will fail on cloud platforms like Render. Set MONGODB_URI in your environment variables.");
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

        // Add GET /api/search for browser testing
        app.get('/api/search', async (req, res) => {
            const query = req.query.q;
            if (!query) {
                return res.status(400).json({ error: 'Query parameter "q" is required.' });
            }
            // List of liquor types for detection
            const LIQUOR_TYPES = [
                "vodka", "whiskey", "rum", "gin", "tequila", "brandy", "scotch", "bourbon", "cognac", "mezcal", "absinthe", "vermouth", "schnapps", "liqueur", "triple sec", "amaretto", "cointreau", "campari", "baileys", "kahlua", "sambuca", "ouzo", "soju", "sake", "port", "sherry", "grappa", "aquavit", "pisco", "armagnac", "calvados", "chartreuse", "curaçao", "maraschino", "frangelico", "drambuie", "jagermeister", "limoncello", "midori", "strega", "tía maria", "galliano", "crème de menthe", "crème de cassis", "crème de cacao"
            ];
            let queryStr: string;
            if (typeof query === 'string') {
                queryStr = query;
            } else if (Array.isArray(query)) {
                queryStr = query[0] as string;
            } else {
                queryStr = String(query);
            }
            const isLiquor = LIQUOR_TYPES.includes(queryStr.trim().toLowerCase());
            try {
                const { fetchAndProcessGeminiResults } = require('./geminiService');
                const { extractBestRecipe } = require('./cocktail');
                // Dynamically import shooters logic
                let shooterRecipe = null;
                try {
                    const { getShooterFromImage, getShooterFromLiquor } = require('./shooters');
                    const fullShooter = await getShooterFromLiquor(queryStr.trim().toLowerCase());
                    if (fullShooter && fullShooter.name && fullShooter.ingredients) {
                        shooterRecipe = {
                            name: fullShooter.name,
                            ingredients: fullShooter.ingredients
                        };
                    } else {
                        shooterRecipe = null;
                    }
                } catch (e) {
                    shooterRecipe = null;
                }
                const resultsFromApi = await fetchAndProcessGeminiResults(queryStr, GEMINI_API_KEY);
                const bestRecipeDetails = extractBestRecipe(resultsFromApi);
                if (isLiquor) {
                    // For liquor/cocktail queries, return both cocktail and shooter recipes
                    return res.json({ results: [], formattedRecipe: bestRecipeDetails, shooterRecipe });
                } else {
                    // For food queries, return beverage pairings
                    return res.json({ results: resultsFromApi, formattedRecipe: null });
                }
            } catch (error) {
                const errorMessage = (error instanceof Error) ? error.message : String(error);
                return res.status(500).json({ error: errorMessage });
            }
        });

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