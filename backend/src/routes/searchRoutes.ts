import axios from 'axios';
import { Router, Request, Response } from 'express';
import { extractBestRecipe, BestRecipe } from '../cocktail';
import { fetchAndProcessGeminiResults } from '../geminiService';
import { FOOD_ITEMS, LIQUOR_TYPES } from '../data/foodItems';
import { Db } from 'mongodb';

const router = Router();
const COLLECTION_NAME = 'searchResults';

export function configureSearchRoutes(db: Db, apiKey: string) {
    // POST /search for text, image, or both
    router.post('/search', async (req: Request, res: Response) => {
        const { image, query } = req.body;
        if (!image && !query) {
            return res.status(400).json({ error: 'Either image or query is required.' });
        }
        if (!apiKey) {
            return res.status(500).json({ error: 'API key for search service is not configured.' });
        }
        try {
            let detectedQuery = query || '';
            let shooterResult = null;
            // If image is present, use Gemini Vision to extract liquor and recommend shooter
            if (image) {
                // Dynamically import shooters logic to avoid circular deps
                const { getShooterFromImage } = await import('../shooters');
                const base64 = image.split(',')[1] || image;
                shooterResult = await getShooterFromImage(base64);
                if (shooterResult && shooterResult.query) {
                    detectedQuery = shooterResult.query;
                }
            }
            if (!detectedQuery) {
                return res.status(200).json({ results: [], formattedRecipe: null, message: 'No recognizable item found.' });
            }
            // Run the normal search logic with the detected query
            const resultsFromApi = await fetchAndProcessGeminiResults(detectedQuery, apiKey);
            const bestRecipeDetails: BestRecipe | null = extractBestRecipe(resultsFromApi);
            const responsePayloadFromApi = {
                results: resultsFromApi,
                formattedRecipe: bestRecipeDetails,
                detectedQuery,
                shooter: shooterResult
            };
            return res.json(responsePayloadFromApi);
        } catch (error: any) {
            console.error('Error during search:', error.message);
            return res.status(500).json({ error: `An error occurred: ${error.message}`, results: [], formattedRecipe: null });
        }
    });
    router.get('/search', (req: Request, res: Response) => {
        (async () => {
            const query = req.query.q as string;
            if (!query) {
                return res.status(400).json({ error: 'Query parameter "q" is required.' });
            }
            const lowercasedQuery = query.toLowerCase();
            if (!apiKey) {
                console.error("Gemini API key is not available.");
                return res.status(500).json({ error: 'API key for search service is not configured.' });
            }
            try {
                const collection = db.collection(COLLECTION_NAME);
                const isLiquorQuery = LIQUOR_TYPES.includes(lowercasedQuery);
                const isFoodQuery = FOOD_ITEMS.includes(lowercasedQuery);
                // Add this new function to catch more potential food items
                const mightBeFoodItem = (query: string) => {
                    // Check if query contains any food-related words
                    const foodKeywords = ['recipe', 'dish', 'food', 'meal', 'cook', 'eat'];
                    return foodKeywords.some(keyword => query.includes(keyword));
                };
                // Use the enhanced check
                if (isLiquorQuery || isFoodQuery || mightBeFoodItem(lowercasedQuery)) {
                    console.log(`Query "${lowercasedQuery}" is a ${isLiquorQuery ? 'liquor type' : (isFoodQuery ? 'food item' : 'potential food query')}. Bypassing cache, fetching fresh data from API.`);
                    // Proceed directly to API fetch, no cache read attempt for these queries.
                } else {
                    // This is NOT a special query, so check the cache.
                    console.log(`Query "${lowercasedQuery}" is NOT a special type. Checking cache.`);
                    const cachedData = await collection.findOne({ query: lowercasedQuery });
                    if (cachedData) {
                        console.log(`Serving query from cache: ${lowercasedQuery}`);
                        const responsePayload = {
                            results: cachedData.results || [],
                            formattedRecipe: cachedData.formattedRecipe as BestRecipe | null
                        };
                        return res.json(responsePayload);
                    }
                    console.log(`Query "${lowercasedQuery}" not in cache. Will fetch from API.`);
                }

                // Fetch from API (all special queries and non-special queries not found in cache will reach here)
                console.log(`Fetching from API for query: ${query} (lowercased: ${lowercasedQuery}).`);
                const resultsFromApi = await fetchAndProcessGeminiResults(query, apiKey);
                
                const bestRecipeDetails: BestRecipe | null = extractBestRecipe(resultsFromApi);
                
                const responsePayloadFromApi = {
                    results: resultsFromApi,
                    formattedRecipe: bestRecipeDetails
                };
                
                // Only save to cache if it's NOT a special query
                if (!isLiquorQuery && !isFoodQuery) {
                    console.log(`Saving regular query "${lowercasedQuery}" to cache.`);
                    await collection.insertOne({ 
                        query: lowercasedQuery, 
                        results: resultsFromApi, 
                        formattedRecipe: bestRecipeDetails,
                        createdAt: new Date() 
                    });
                    console.log(`Saved to cache: ${lowercasedQuery}`);
                } else {
                    console.log(`Query "${lowercasedQuery}" is a special type. Results from API will NOT be saved to cache.`);
                }
                
                return res.json(responsePayloadFromApi);

            } catch (error: any) {
                console.error(`Error during search for query "${query}":`, error.message);
                return res.status(500).json({ 
                    error: `An error occurred: ${error.message}`, 
                    results: [], 
                    formattedRecipe: null 
                });
            }
        })();
    });

    return router;
}