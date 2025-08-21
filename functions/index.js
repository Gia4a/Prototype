// functions/index.js
require('dotenv').config();

const functions = require('firebase-functions');
const axios = require('axios');

exports.getMixologistSuggestion = functions
    .region('us-central1')
    .runWith({
        memory: '256MB',
        timeoutSeconds: 60
    })
    .https.onCall(async (data, context) => {
    console.log('Received function call with data:', data);
    console.log('Context:', context);

    const userQuery = data.query;

    if (!userQuery) {
        console.error('No query provided in data:', data);
        throw new functions.https.HttpsError('invalid-argument', 'The "query" parameter is required.');
    }

    console.log('Processing query:', userQuery);

    // --- 1. Smart Prompt Engineering ---
    let promptText = `As an expert mixologist, please provide a suggestion for: "${userQuery}".`;

    const lowerCaseQuery = userQuery.toLowerCase();
    if (lowerCaseQuery.includes('pho')) {
        promptText = `You are an expert mixologist. What drink, specifically a wine, pairs best with Vietnamese Pho? Focus on a non-standardized, insightful pairing that complements the dish's unique flavors.`;
    } else if (lowerCaseQuery.includes('vodka') || lowerCaseQuery.includes('whiskey') || lowerCaseQuery.includes('rum') || lowerCaseQuery.includes('gin')) {
        promptText = `You are an expert mixologist. For someone who enjoys ${userQuery}, what is a surprising and delightful food pairing, perhaps an ethnic dish, that goes well with a ${userQuery}-based drink? Also, suggest an actual wine pairing that offers a similar complementary experience.`;
    } else if (lowerCaseQuery.includes('recipe')) {
        promptText = `You are an expert mixologist. Provide a detailed recipe for: "${userQuery}".`;
    } else {
        promptText = `You are an expert mixologist for a liquor delivery app. Based on the user's query "${userQuery}", provide a creative drink suggestion or pairing. For food, include a non-standardized pairing. For drinks, offer a unique twist or suggestion.`;
    }

    // --- 2. Call the Gemini API ---
    let geminiResponseText = "Sorry, I couldn't get a suggestion right now. Please try again later!";

    try {
        const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
        
        // Get API key from environment variable (preferred method)
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        
        if (!GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY not found in environment variables');
            throw new Error('API key not configured. Please set GEMINI_API_KEY in your .env file');
        }

        console.log('Calling Gemini API with prompt:', promptText.substring(0, 100) + '...');

        const response = await axios.post(
            `${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000, // 30 second timeout
            }
        );

        console.log('Gemini API response status:', response.status);
        console.log('Gemini API response data structure:', JSON.stringify(response.data, null, 2));

        // Parse the response from Gemini
        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            geminiResponseText = response.data.candidates[0].content.parts[0].text;
            console.log('Successfully extracted response text');
        } else {
            console.warn('Unexpected Gemini API response structure:', response.data);
            geminiResponseText = "Hmm, the mixologist is thinking... try asking in a different way!";
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error.message);
        if (error.response) {
            console.error("Gemini API error details:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
        }
        if (error.code === 'ECONNABORTED') {
            geminiResponseText = "The mixologist is taking too long to respond. Please try again!";
        } else {
            geminiResponseText = "Apologies, the mixologist is currently restocking! Please try again soon.";
        }
    }

    // --- 3. Return the response to the client ---
    const result = {
        originalQuery: userQuery,
        generatedPrompt: promptText,
        mixologistSuggestion: geminiResponseText,
        timestamp: new Date().toISOString()
    };

    console.log('Returning result to client');
    return result;
});