// functions/index.js

const functions = require('firebase-functions');
const axios = require('axios'); // Import axios for making HTTP requests

// You'll need to initialize your Firebase Admin SDK if you haven't already
// admin.initializeApp(); // Uncomment if you need it for other Firebase services

/**
 * Cloud Function to act as our "Mixologist AI".
 * It takes a user's query, enriches it, and sends it to Gemini.
 */
exports.getMixologistSuggestion = functions.https.onCall(async (data, context) => {
    const userQuery = data.query;

    if (!userQuery) {
        throw new functions.https.HttpsError('invalid-argument', 'The "query" parameter is required.');
    }

    // --- 1. Smart Prompt Engineering (as discussed) ---
    // This logic determines what prompt to send to Gemini based on user's input.
    let promptText = `As an expert mixologist, please provide a suggestion for: "${userQuery}".`;

    const lowerCaseQuery = userQuery.toLowerCase();
    if (lowerCaseQuery.includes('pho')) {
        promptText = `You are an expert mixologist. What drink, specifically a wine, pairs best with Vietnamese Pho? Focus on a non-standardized, insightful pairing that complements the dish's unique flavors.`;
    } else if (lowerCaseQuery.includes('vodka') || lowerCaseQuery.includes('whiskey') || lowerCaseQuery.includes('rum') || lowerCaseQuery.includes('gin')) {
        promptText = `You are an expert mixologist. For someone who enjoys ${userQuery}, what is a surprising and delightful food pairing, perhaps an ethnic dish, that goes well with a ${userQuery}-based drink? Also, suggest an actual wine pairing that offers a similar complementary experience.`;
    } else if (lowerCaseQuery.includes('recipe')) {
        promptText = `You are an expert mixologist. Provide a detailed recipe for: "${userQuery}".`;
    } else {
        // Fallback for general queries
        promptText = `You are an expert mixologist for a liquor delivery app. Based on the user's query "${userQuery}", provide a creative drink suggestion or pairing. For food, include a non-standardized pairing. For drinks, offer a unique twist or suggestion.`;
    }

    // --- 2. Call the Gemini API ---
    let geminiResponseText = "Sorry, I couldn't get a suggestion right now. Please try again later!"; // Default error message

    try {
        // IMPORTANT: Replace this with the actual Gemini API endpoint you are using.
        // This is a placeholder as the exact URL can vary by model/version.
        // Example: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
        const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        const GEMINI_API_KEY = functions.config().gemini.key; // Get API key from environment config

        const response = await axios.post(
            GEMINI_API_ENDPOINT,
            {
                contents: [{ parts: [{ text: promptText }] }],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GEMINI_API_KEY, // Use your API key here
                },
            }
        );

        // Parse the response from Gemini
        // The structure can vary slightly depending on the Gemini API version/model.
        // You might need to adjust this based on the actual response format.
        if (response.data && response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content && response.data.candidates[0].content.parts[0]) {
            geminiResponseText = response.data.candidates[0].content.parts[0].text;
        } else {
            console.warn('Unexpected Gemini API response structure:', response.data);
            geminiResponseText = "Hmm, the mixologist is thinking... try asking in a different way!";
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error.message);
        // Log more details if available (e.g., error.response.data for axios errors)
        if (error.response) {
            console.error("Gemini API error details:", error.response.status, error.response.data);
        }
        geminiResponseText = "Apologies, the mixologist is currently restocking! Please try again soon.";
    }

    // --- 3. Return the response to the client ---
    return {
        originalQuery: userQuery,
        generatedPrompt: promptText, // We still return the generated prompt for your logging/analysis
        mixologistSuggestion: geminiResponseText,
        timestamp: new Date().toISOString()
    };
});
