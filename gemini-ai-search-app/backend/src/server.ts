// filepath: gemini-ai-search-app/backend/src/server.ts
import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import { findAndFormatFirstTextRecipe } from './cocktail';
import { MongoClient, Db } from 'mongodb'; // Import MongoClient

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3001;

// --- IMPORTANT: Configure CORS ---
// For development, you can allow your frontend origin.
// For production, be more restrictive.
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173'; // Vite's default
app.use(cors({
    origin: frontendURL
}));

app.use(express.json());

// ---- MODIFIED LINE ----
// Updated to use the model from your curl command example
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- MongoDB Setup ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017'; // Default local MongoDB URI
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
        process.exit(1); // Exit if DB connection fails
    }
}
// --- End MongoDB Setup ---

if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in .env file.");
    // process.exit(1); // Optionally exit if key is missing
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

        // --- Check MongoDB Cache First ---
        try {
            if (!db) {
                console.warn("MongoDB not connected yet. Skipping cache check.");
            } else {
                const cachedData = await db.collection(COLLECTION_NAME).findOne({ query: query.toLowerCase() });
                if (cachedData) {
                    console.log(`Serving from cache for query: ${query}`);
                    // Ensure the structure matches what the frontend expects
                    return res.json({
                        results: cachedData.results,
                        formattedRecipe: cachedData.formattedRecipe
                    });
                }
            }
        } catch (cacheError) {
            console.error("Error checking MongoDB cache:", cacheError);
            // Proceed to API call if cache check fails
        }
        // --- End Cache Check ---

        try {
            // --- This is a SIMPLIFIED example of calling a Gemini-like API ---
            // You will need to adapt this to the *actual* Gemini API request structure.
            // The Gemini API typically requires a POST request with a specific JSON body.
            // For example, for content generation:
            const requestBody = {
                contents: [{
                    parts: [{
                        text: `Provide search results for: ${query}. For each result, include a title, a brief snippet, and if applicable, a file path. Format as JSON array.`
                        // You might need to fine-tune this prompt for better results
                        // and instruct it to return JSON if possible, or parse its text response.
                    }]
                }]
                // Add generationConfig, safetySettings etc. as per Gemini API docs
            };

            const geminiResponse = await axios.post(
                `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            // --- IMPORTANT: Process the Gemini API Response ---
            // The structure of geminiResponse.data will depend heavily on the Gemini API
            // and your prompt. You'll need to parse it to fit the `SearchResult` interface.
            // This is a placeholder for that parsing logic.
            // Let's assume Gemini returns text that you need to parse, or structured JSON.
            // If it returns text, you might need a robust parsing strategy.
            // If it can return JSON directly (e.g. via prompt engineering), that's better.

            let resultsFromApi: any[] = [];
            try {
                let responseText = geminiResponse.data.candidates[0].content.parts[0].text;
                
                // Clean the responseText: Remove Markdown JSON block fences if present
                const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
                const match = responseText.match(jsonRegex);
                if (match && match[1]) {
                    responseText = match[1];
                }

                resultsFromApi = JSON.parse(responseText); 
            } catch (parseError) {
                console.error("Error parsing Gemini response:", parseError);
                console.error("Original responseText that failed parsing:", geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text);
                resultsFromApi = [{
                    id: 'gemini-raw-parse-failed', // Changed ID to be more specific
                    title: 'Gemini Raw Response - Parse Failed',
                    snippet: geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not parse response.",
                    filePath: null
                }];
            }

            const mappedResultsForFrontend = resultsFromApi.map((item: any, index: number) => ({
                id: item.id || `gemini-result-${index}-${Date.now()}`,
                title: item.title || 'Untitled Result',
                filePath: item.filePath || item.file_path,
                snippet: item.snippet || 'No snippet available.'
            }));

            const recipeString = findAndFormatFirstTextRecipe(mappedResultsForFrontend);

            // --- Save to MongoDB Cache ---
            try {
                if (db) {
                    await db.collection(COLLECTION_NAME).insertOne({
                        query: query.toLowerCase(),
                        results: mappedResultsForFrontend,
                        formattedRecipe: recipeString,
                        createdAt: new Date()
                    });
                    console.log(`Cached results for query: ${query}`);
                }
            } catch (cacheSaveError) {
                console.error("Error saving to MongoDB cache:", cacheSaveError);
            }
            // --- End Save to Cache ---

            if (recipeString && !recipeString.startsWith("Could not parse") && !recipeString.startsWith("No recipe item found")) {
                return res.json({
                    results: mappedResultsForFrontend,
                    formattedRecipe: recipeString
                });
            }

            res.json({ results: mappedResultsForFrontend });

        } catch (error: any) {
            console.error('Error calling Gemini API:', error.response?.data || error.message);
            res.status(error.response?.status || 500).json({
                message: 'Failed to fetch results from Gemini API.',
                details: error.response?.data?.error?.message || error.message
            });
        }
    })();
});

// --- Start Server and Connect to DB ---
async function startServer() {
    await connectToMongo(); // Connect to DB before starting the server
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
// --- End Start Server ---