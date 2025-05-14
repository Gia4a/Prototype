// filepath: gemini-ai-search-app/backend/src/server.ts
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { extractBestRecipe, BestRecipe } from './cocktail'; // Import BestRecipe interface
import { MongoClient, Db } from 'mongodb';
import { fetchAndProcessGeminiResults, GeminiSearchResultItem } from './geminiService';

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
const COLLECTION_NAME = 'searchResults';
let db: Db;

async function connectToMongo() {
    try {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log(`Successfully connected to MongoDB: ${DB_NAME}`);
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1);
    }
}

if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in .env file.");
}

app.get('/api/search', (req: Request, res: Response) => {
    (async () => {
        const query = req.query.q as string;
        const lowercasedQuery = query.toLowerCase();

        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required.' });
        }

        if (!GEMINI_API_KEY) {
            console.error("Gemini API key is not available.");
            return res.status(500).json({ error: 'API key for search service is not configured.' });
        }

        try {
            const collection = db.collection(COLLECTION_NAME);
            const cachedData = await collection.findOne({ query: lowercasedQuery });

            if (cachedData) {
                console.log(`Serving from cache for query: ${lowercasedQuery}`);
                const responsePayload = {
                    results: cachedData.results || [],
                    formattedRecipe: cachedData.formattedRecipe as BestRecipe | null // Cast to BestRecipe
                };
                console.log('Data being sent to frontend (from cache):', JSON.stringify(responsePayload, null, 2)); 
                return res.json(responsePayload);
            }

            console.log(`No cache hit for query: ${lowercasedQuery}. Fetching from API.`);
            const resultsFromApi = await fetchAndProcessGeminiResults(query, GEMINI_API_KEY);
            
            const bestRecipeDetails: BestRecipe | null = extractBestRecipe(resultsFromApi); // This will be BestRecipe | null
            
            const responsePayloadFromApi = {
                results: resultsFromApi,
                formattedRecipe: bestRecipeDetails // Send the BestRecipe object or null
            };
            console.log('Data being sent to frontend (from API):', JSON.stringify(responsePayloadFromApi, null, 2));
            
            await collection.insertOne({ 
                query: lowercasedQuery, 
                results: resultsFromApi, 
                formattedRecipe: bestRecipeDetails, // Save the BestRecipe object or null
                createdAt: new Date() 
            });
            
            return res.json(responsePayloadFromApi);

        } catch (error: any) {
            console.error(`Error during search for query "${query}":`, error.message);
            return res.status(500).json({ error: `An error occurred: ${error.message}`, results: [], formattedRecipe: null });
        }
    })();
});

async function startServer() {
    await connectToMongo();
    app.listen(PORT, () => {
        console.log(`Backend server is running on http://localhost:${PORT}`);
        if (GEMINI_API_KEY) {
            console.log("Gemini API Key loaded.");
        } else {
            console.warn("Gemini API Key is MISSING. The /api/search endpoint will not work correctly.");
        }
    });
}

startServer();