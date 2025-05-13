// filepath: gemini-ai-search-app/backend/src/server.ts
import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

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

            let results: any[] = [];
            // Example: if geminiResponse.data.candidates[0].content.parts[0].text is a JSON string
            try {
                const responseText = geminiResponse.data.candidates[0].content.parts[0].text;
                results = JSON.parse(responseText); // This assumes Gemini returns a parsable JSON string
                                                    // This is a big assumption and might require prompt engineering.
            } catch (parseError) {
                console.error("Error parsing Gemini response:", parseError);
                // Fallback or attempt to extract info differently if direct JSON parsing fails
                results = [{
                    id: 'gemini-raw',
                    title: 'Gemini Raw Response',
                    snippet: geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not parse response.",
                }];
            }


            // Ensure results match the SearchResult structure expected by the frontend
            const formattedResults = results.map((item: any, index: number) => ({
                id: item.id || `gemini-result-${index}-${Date.now()}`,
                title: item.title || 'Untitled Result',
                filePath: item.filePath,
                snippet: item.snippet || 'No snippet available.'
            }));


            res.json({ results: formattedResults });

        } catch (error: any) {
            console.error('Error calling Gemini API:', error.response?.data || error.message);
            res.status(error.response?.status || 500).json({
                message: 'Failed to fetch results from Gemini API.',
                details: error.response?.data?.error?.message || error.message
            });
        }
    })();
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    if (GEMINI_API_KEY) {
        console.log("Gemini API Key loaded.");
    } else {
        console.warn("Gemini API Key is MISSING. The /api/search endpoint will not work correctly.");
    }
});