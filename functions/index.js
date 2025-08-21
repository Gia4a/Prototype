// functions/index.js
require('dotenv').config();

const functions = require('firebase-functions');
const { fetchAndProcessGeminiResults } = require('./geminiService'); // Import your service
const { extractBestRecipe } = require('./cocktail'); // Import recipe extraction

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

        // Get API key from environment variable
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        
        if (!GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY not found in environment variables');
            throw new functions.https.HttpsError('failed-precondition', 'API key not configured. Please set GEMINI_API_KEY in your .env file');
        }

        let geminiResults = [];
        let mixologistSuggestion = "Sorry, I couldn't get a suggestion right now. Please try again later!";

        try {
            console.log('Calling new Gemini service with enhanced prompt engineering...');
            
            // Use your sophisticated service instead of direct API call
            geminiResults = await fetchAndProcessGeminiResults(userQuery, GEMINI_API_KEY);
            
            console.log('Gemini service returned results:', geminiResults);

            if (geminiResults && geminiResults.length > 0) {
                // Try to extract a complete recipe first
                const bestRecipe = extractBestRecipe(geminiResults);
                
                if (bestRecipe) {
                    // Format as a complete recipe
                    mixologistSuggestion = `🍸 ${bestRecipe.title}\n\n${bestRecipe.recipe}`;
                } else {
                    // Format the first result as a suggestion
                    const firstResult = geminiResults[0];
                    mixologistSuggestion = `🍸 ${firstResult.title}\n\n${firstResult.snippet}`;
                    
                    // Add second result if available
                    if (geminiResults[1]) {
                        const secondResult = geminiResults[1];
                        mixologistSuggestion += `\n\n🍸 ${secondResult.title}\n\n${secondResult.snippet}`;
                    }
                }
            } else {
                console.warn('No results returned from Gemini service');
                mixologistSuggestion = "Hmm, the mixologist is thinking... try asking in a different way!";
            }

        } catch (error) {
            console.error("Error calling Gemini service:", error.message);
            
            if (error.message.includes('API key')) {
                mixologistSuggestion = "API configuration error. Please check the setup.";
            } else if (error.message.includes('timeout') || error.code === 'ECONNABORTED') {
                mixologistSuggestion = "The mixologist is taking too long to respond. Please try again!";
            } else if (error.message.includes('JSON')) {
                mixologistSuggestion = "The mixologist is having trouble organizing their thoughts. Please try rephrasing your request!";
            } else {
                mixologistSuggestion = "Apologies, the mixologist is currently restocking! Please try again soon.";
            }
        }

        // Return the response to the client
        const result = {
            originalQuery: userQuery,
            mixologistSuggestion: mixologistSuggestion,
            timestamp: new Date().toISOString(),
            resultsCount: geminiResults.length,
            // Optional: include raw results for debugging
            // rawResults: geminiResults
        };

        console.log('Returning result to client');
        return result;
    });