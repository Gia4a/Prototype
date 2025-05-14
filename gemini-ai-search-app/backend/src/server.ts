// filepath: gemini-ai-search-app/backend/src/server.ts
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { extractBestRecipe } from './cocktail'; // Updated import
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

        if (!query) {
            return res.status(400).json({ message: 'Query parameter "q" is required.' });
        }

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ message: 'API key for Gemini service is not configured on the server.' });
        }

        // --- CACHE CHECK MODIFIED ---
        try {
            if (db) {
                const cachedData = await db.collection(COLLECTION_NAME).findOne({ query: query.toLowerCase() });
                if (cachedData) {
                    console.log(`Serving from cache for query: ${query}`);
                    const recipeStringFromCache = cachedData.formattedRecipe as string | null;
                    const resultsFromCache = cachedData.results as GeminiSearchResultItem[] | null;

                    const isInformationalMessage = recipeStringFromCache && (
                        recipeStringFromCache.startsWith("Could not parse") ||
                        recipeStringFromCache.startsWith("No recipe item found") ||
                        recipeStringFromCache.startsWith("Recipe file") ||
                        recipeStringFromCache.startsWith("Found item") ||
                        recipeStringFromCache.startsWith("Found liquor.com item")
                    );

                    if (recipeStringFromCache && !isInformationalMessage) {
                        console.log("Sending formatted recipe from cache to client.");
                        // If you ONLY want to send the recipe and not the other search results:
                        // return res.json({ formattedRecipe: recipeStringFromCache });
                        // If you want to send both, but expect frontend to prioritize:
                        return res.json({
                            results: resultsFromCache || [], // Send empty array if results somehow null
                            formattedRecipe: recipeStringFromCache
                        });
                    } else if (recipeStringFromCache && isInformationalMessage) {
                        console.log("Cached recipe was informational, sending search results from cache:", recipeStringFromCache);
                        return res.json({ results: resultsFromCache || [] });
                    } else {
                        console.log("No valid formatted recipe in cache, sending search results from cache.");
                        return res.json({ results: resultsFromCache || [] });
                    }
                }
            } else {
                console.warn("MongoDB not connected yet. Skipping cache check.");
            }
        } catch (cacheError) {
            console.error("Error checking MongoDB cache:", cacheError);
        }
        // --- END OF CACHE CHECK MODIFICATION ---

        // --- CACHE MISS LOGIC (remains the same) ---
        try {
            const mappedResultsForFrontend: GeminiSearchResultItem[] = await fetchAndProcessGeminiResults(query, GEMINI_API_KEY);
            const recipeString = extractBestRecipe(mappedResultsForFrontend);

            if (db) {
                try {
                    await db.collection(COLLECTION_NAME).insertOne({
                        query: query.toLowerCase(),
                        results: mappedResultsForFrontend,
                        formattedRecipe: recipeString,
                        createdAt: new Date()
                    });
                    console.log(`Cached results for query: ${query}`);
                } catch (cacheSaveError) {
                    console.error("Error saving to MongoDB cache:", cacheSaveError);
                }
            } else {
                console.warn("MongoDB not connected at the time of caching attempt. Skipping save.");
            }

            const isInformationalMessage = recipeString && (
                recipeString.startsWith("Could not parse") ||
                recipeString.startsWith("No recipe item found") ||
                recipeString.startsWith("Recipe file") ||
                recipeString.startsWith("Found item") ||
                recipeString.startsWith("Found liquor.com item")
            );

            if (recipeString && !isInformationalMessage) {
                console.log("Sending formatted recipe (new) to client.");
                // If you ONLY want to send the recipe and not the other search results:
                // return res.json({ formattedRecipe: recipeString });
                // If you want to send both, but expect frontend to prioritize:
                return res.json({
                    results: mappedResultsForFrontend,
                    formattedRecipe: recipeString
                });
            } else if (recipeString && isInformationalMessage) {
                console.log("Recipe extraction attempt (new, informational message):", recipeString);
                return res.json({ results: mappedResultsForFrontend });
            } else {
                console.log("No recipe extracted (new), sending search results only.");
                return res.json({ results: mappedResultsForFrontend });
            }

        } catch (error: any) {
            console.error('Error in search route after calling service:', error.message);
            res.status(500).json({
                message: 'Failed to fetch or process results.',
                details: error.message 
            });
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