// functions/index.js
require('dotenv').config();

const functions = require('firebase-functions');
const { fetchAndProcessGeminiResults } = require('./geminiService');
const { extractBestRecipe } = require('./cocktail');
const { isFoodItem, isShooterQuery } = require('./constants');

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
                // Determine response formatting based on query type
                const isFood = isFoodItem(userQuery);
                const isShooter = isShooterQuery(userQuery);

                if (isFood) {
                    // Format as beverage pairings
                    mixologistSuggestion = formatFoodPairings(geminiResults);
                } else if (isShooter) {
                    // Format as shooter recipes
                    mixologistSuggestion = formatShooterRecipes(geminiResults);
                } else {
                    // Try to extract a complete cocktail recipe first
                    const bestRecipe = extractBestRecipe(geminiResults);
                    
                    if (bestRecipe) {
                        // Format as a complete recipe
                        mixologistSuggestion = `🍸 ${bestRecipe.title}\n\n${bestRecipe.recipe}`;
                    } else {
                        // Format as general suggestions
                        mixologistSuggestion = formatGeneralSuggestions(geminiResults);
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

// Format food pairings (wine, spirit, beer)
function formatFoodPairings(results) {
    if (!results || results.length === 0) {
        return "No beverage pairings found. Please try again!";
    }

    let formattedResponse = "🍷 Beverage Pairings\n\n";
    
    results.forEach((result, index) => {
        formattedResponse += `${result.title}\n`;
        formattedResponse += `${result.snippet}\n`;
        
        if (index < results.length - 1) {
            formattedResponse += "\n";
        }
    });
    
    return formattedResponse;
}

// Format shooter recipes
function formatShooterRecipes(results) {
    if (!results || results.length === 0) {
        return "No shooter recipes found. Please try again!";
    }

    let formattedResponse = "🥃 Shooter Recipes\n\n";
    
    results.forEach((result, index) => {
        formattedResponse += `🍸 ${result.title}\n\n${result.snippet}`;
        
        if (index < results.length - 1) {
            formattedResponse += "\n\n";
        }
    });
    
    return formattedResponse;
}

// Format general cocktail suggestions
function formatGeneralSuggestions(results) {
    if (!results || results.length === 0) {
        return "No suggestions found. Please try again!";
    }

    let formattedResponse = "";
    
    results.forEach((result, index) => {
        formattedResponse += `🍸 ${result.title}\n\n${result.snippet}`;
        
        if (index < results.length - 1) {
            formattedResponse += "\n\n";
        }
    });
    
    return formattedResponse;
}