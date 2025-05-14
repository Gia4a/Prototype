"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// filepath: gemini-ai-search-app/backend/src/server.ts
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config(); // Load environment variables from .env file
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// --- IMPORTANT: Configure CORS ---
// For development, you can allow your frontend origin.
// For production, be more restrictive.
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173'; // Vite's default
app.use((0, cors_1.default)({
    origin: frontendURL
}));
app.use(express_1.default.json());
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in .env file.");
    // process.exit(1); // Optionally exit if key is missing
}
app.get('/api/search', (req, res) => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const query = req.query.q;
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
            const geminiResponse = yield axios_1.default.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            // --- IMPORTANT: Process the Gemini API Response ---
            // The structure of geminiResponse.data will depend heavily on the Gemini API
            // and your prompt. You'll need to parse it to fit the `SearchResult` interface.
            // This is a placeholder for that parsing logic.
            // Let's assume Gemini returns text that you need to parse, or structured JSON.
            // If it returns text, you might need a robust parsing strategy.
            // If it can return JSON directly (e.g. via prompt engineering), that's better.
            let results = [];
            // Example: if geminiResponse.data.candidates[0].content.parts[0].text is a JSON string
            try {
                const responseText = geminiResponse.data.candidates[0].content.parts[0].text;
                results = JSON.parse(responseText); // This assumes Gemini returns a parsable JSON string
                // This is a big assumption and might require prompt engineering.
            }
            catch (parseError) {
                console.error("Error parsing Gemini response:", parseError);
                // Fallback or attempt to extract info differently if direct JSON parsing fails
                results = [{
                        id: 'gemini-raw',
                        title: 'Gemini Raw Response',
                        snippet: ((_e = (_d = (_c = (_b = (_a = geminiResponse.data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) || "Could not parse response.",
                    }];
            }
            // Ensure results match the SearchResult structure expected by the frontend
            const formattedResults = results.map((item, index) => ({
                id: item.id || `gemini-result-${index}-${Date.now()}`,
                title: item.title || 'Untitled Result',
                filePath: item.filePath,
                snippet: item.snippet || 'No snippet available.'
            }));
            res.json({ results: formattedResults });
        }
        catch (error) {
            console.error('Error calling Gemini API:', ((_f = error.response) === null || _f === void 0 ? void 0 : _f.data) || error.message);
            res.status(((_g = error.response) === null || _g === void 0 ? void 0 : _g.status) || 500).json({
                message: 'Failed to fetch results from Gemini API.',
                details: ((_k = (_j = (_h = error.response) === null || _h === void 0 ? void 0 : _h.data) === null || _j === void 0 ? void 0 : _j.error) === null || _k === void 0 ? void 0 : _k.message) || error.message
            });
        }
    }))();
});
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    if (GEMINI_API_KEY) {
        console.log("Gemini API Key loaded.");
    }
    else {
        console.warn("Gemini API Key is MISSING. The /api/search endpoint will not work correctly.");
    }
});
