// functions/geminiService.js
const axios = require('axios');
const { isFoodItem, isLiquorType, isFlavoredLiquor, isShooterQuery } = require('./constants');

// Constants
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';
const CLASSIC_COCKTAILS = [
    'moscow mule', 'old fashioned', 'manhattan', 'martini', 'margarita', 
    'mojito', 'daiquiri', 'whiskey sour', 'cosmopolitan', 'mai tai',
    'pina colada', 'bloody mary', 'mimosa', 'negroni', 'aperol spritz',
    'gin and tonic', 'vodka tonic', 'rum and coke', 'cuba libre',
    'long island iced tea', 'amaretto sour', 'white russian', 'black russian',
    'screwdriver', 'tom collins', 'john collins', 'mint julep', 'sazerac'
];

// Helper function to check if query is for a classic cocktail
function isClassicCocktailRequest(query) {
    const normalizedQuery = query.toLowerCase().trim();
    return CLASSIC_COCKTAILS.some(cocktail => 
        normalizedQuery === cocktail || 
        normalizedQuery === cocktail + ' recipe' ||
        normalizedQuery.startsWith(cocktail + ' ') ||
        normalizedQuery.endsWith(' ' + cocktail)
    );
}

// Improved JSON extraction and parsing
function extractAndParseJSON(responseText) {
    console.log("Raw response to parse:", responseText);
    
    try {
        // Remove markdown code blocks first
        let cleanText = responseText.replace(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/g, '$1');
        
        // Find JSON array boundaries more robustly
        const startIdx = cleanText.indexOf('[');
        const lastIdx = cleanText.lastIndexOf(']');
        
        if (startIdx === -1 || lastIdx === -1 || startIdx >= lastIdx) {
            throw new Error('No valid JSON array found in response');
        }
        
        // Extract potential JSON
        cleanText = cleanText.substring(startIdx, lastIdx + 1).trim();
        
        // Clean common JSON issues
        cleanText = cleanText
            .replace(/,\s*([}\]])/g, '$1')  // Remove trailing commas
            .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')  // Quote unquoted keys
            .replace(/:\s*([^",\[\]{}]+?)(\s*[,}\]])/g, (match, value, ending) => {
                // Only quote if it's not already quoted, a number, boolean, or null
                const trimmed = value.trim();
                if (trimmed === 'null' || trimmed === 'true' || trimmed === 'false' || 
                    /^-?\d+\.?\d*$/.test(trimmed) || trimmed.startsWith('"')) {
                    return ':' + trimmed + ending;
                }
                return ':"' + trimmed.replace(/"/g, '\\"') + '"' + ending;
            });
        
        console.log("Cleaned JSON string:", cleanText);
        
        const parsed = JSON.parse(cleanText);
        
        // Validate structure
        if (!Array.isArray(parsed)) {
            throw new Error('Response is not an array');
        }
        
        return parsed;
        
    } catch (error) {
        console.error("JSON parsing failed:", error.message);
        console.error("Failed text:", responseText);
        
        // Return fallback structure
        return [{
            title: "Mixologist Suggestion",
            snippet: "I apologize, but I encountered an issue processing your request. Please try a different search term.",
            filePath: null,
            why: "Fallback response due to parsing error."
        }];
    }
}

// Simplified prompts with stricter JSON requirements
const getClassicCocktailPrompt = (query) => `
Provide the traditional recipe for "${query}" in exactly this JSON format. Do not include any text before or after the JSON array:

[
  {
    "title": "Classic ${query}",
    "snippet": "Ingredients: [list with exact measurements]. Instructions: [step-by-step method].",
    "filePath": null,
    "why": "Traditional recipe."
  }
]`;

const getShooterPrompt = (query) => `
Create shooter recipes for "${query}" using common ingredients. Respond with only this JSON format:

[
  {
    "title": "Simple ${query} Shot",
    "snippet": "Ingredients: [list with measurements]. Instructions: [method].",
    "filePath": null,
    "why": "Easy to make shooter."
  },
  {
    "title": "Premium ${query} Shot", 
    "snippet": "Ingredients: [list with measurements]. Instructions: [method].",
    "filePath": null,
    "why": "Enhanced version."
  }
]`;

const getFoodPairingPrompt = (query) => `
Suggest beverage pairings for "${query}". Respond with only this JSON format:

[
  {
    "title": "Wine Pairing for ${query}",
    "snippet": "Pairing Notes: [wine recommendation and why it works]. Serving: [temperature and glass].",
    "filePath": "willowpark.net",
    "why": "Complementary wine pairing."
  },
  {
    "title": "Cocktail Pairing for ${query}",
    "snippet": "Pairing Notes: [cocktail recommendation and why]. Serving: [preparation notes].",
    "filePath": "willowpark.net", 
    "why": "Spirit-based pairing."
  },
  {
    "title": "Beer Pairing for ${query}",
    "snippet": "Pairing Notes: [beer style and reasoning]. Serving: [temperature and glass].",
    "filePath": "willowpark.net",
    "why": "Beer pairing option."
  }
]`;

const getLiquorPrompt = (query) => `
Create cocktails using "${query}". Respond with only this JSON format:

[
  {
    "title": "Classic ${query} Cocktail",
    "snippet": "Ingredients: [list with measurements]. Instructions: [method].",
    "filePath": null,
    "why": "Traditional cocktail."
  },
  {
    "title": "Modern ${query} Mix",
    "snippet": "Ingredients: [list with measurements]. Instructions: [method].",
    "filePath": null,
    "why": "Contemporary variation."
  }
]`;

const getCocktailPrompt = (query) => `
Create cocktail suggestions for "${query}". Respond with only this JSON format:

[
  {
    "title": "Signature ${query} Drink",
    "snippet": "Ingredients: [list with measurements]. Instructions: [method].",
    "filePath": null,
    "why": "Custom cocktail suggestion."
  },
  {
    "title": "Alternative ${query} Mix",
    "snippet": "Ingredients: [list with measurements]. Instructions: [method].", 
    "filePath": null,
    "why": "Different approach."
  }
]`;

// Fallback function for any category
function createFallbackResponse(query, category = 'general') {
    const fallbackData = {
        food: [{
            title: `Beverage Pairing for ${query}`,
            snippet: `A thoughtfully selected beverage that complements ${query}. The pairing enhances both the food and drink experience through balanced flavors.`,
            filePath: "willowpark.net",
            why: "Professional pairing recommendation."
        }],
        liquor: [{
            title: `${query} Cocktail Suggestion`,
            snippet: `A well-balanced cocktail featuring ${query} as the base spirit. Mixed with complementary ingredients for optimal flavor.`,
            filePath: null,
            why: "Classic preparation method."
        }],
        general: [{
            title: `Mixologist Suggestion for ${query}`,
            snippet: `A carefully crafted recommendation based on your search for ${query}. This suggestion considers flavor balance and accessibility.`,
            filePath: null,
            why: "Expert mixologist recommendation."
        }]
    };
    
    return fallbackData[category] || fallbackData.general;
}

// Main Function
async function fetchAndProcessGeminiResults(query, apiKey) {
    if (!apiKey) {
        throw new Error('API key for Gemini service is not configured.');
    }

    // Query categorization
    const isClassicCocktail = isClassicCocktailRequest(query);
    const isFood = isFoodItem(query);
    const isLiquor = isLiquorType(query);
    const isFlavoredFromList = isFlavoredLiquor(query);
    const isShooter = isShooterQuery(query);

    console.log(`Query Analysis - "${query}": classic=${isClassicCocktail}, food=${isFood}, liquor=${isLiquor}, shooter=${isShooter}`);

    // Select appropriate prompt
    let promptText = '';
    let category = 'general';
    
    if (isClassicCocktail) {
        promptText = getClassicCocktailPrompt(query);
        category = 'cocktail';
    } else if (isShooter) {
        promptText = getShooterPrompt(query);
        category = 'liquor';
    } else if (isFood) {
        promptText = getFoodPairingPrompt(query);
        category = 'food';
    } else if (isLiquor || isFlavoredFromList) {
        promptText = getLiquorPrompt(query);
        category = 'liquor';
    } else {
        promptText = getCocktailPrompt(query);
        category = 'general';
    }

    // API Request with conservative settings
    const requestBody = {
        contents: [{
            parts: [{
                text: promptText
            }]
        }],
        generationConfig: {
            temperature: 0.3,      // Low for consistency
            topK: 10,             // Focused responses
            topP: 0.8,            // Balanced creativity
            maxOutputTokens: 1024  // Prevent truncation
        }
    };

    try {
        console.log("Sending request to Gemini API...");
        
        const geminiResponse = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000  // 30 second timeout
            }
        );

        console.log("Gemini API Response Status:", geminiResponse.status);
        
        if (!geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.error("Invalid Gemini response structure:", geminiResponse.data);
            throw new Error('Invalid response structure from Gemini API');
        }

        const responseText = geminiResponse.data.candidates[0].content.parts[0].text;
        console.log("Raw Gemini response:", responseText);

        // Parse the response
        let resultsFromApi = extractAndParseJSON(responseText);
        
        // Validate and clean results
        const mappedResults = resultsFromApi.map((item, index) => ({
            id: item.id || `gemini-result-${index}-${Date.now()}`,
            title: item.title || `Recommendation ${index + 1}`,
            filePath: item.filePath || null,
            snippet: item.snippet || 'No details available.'
        })).filter(result => result.title && result.snippet);

        // Ensure we always return at least one result
        if (mappedResults.length === 0) {
            console.log("No valid results, using fallback");
            return createFallbackResponse(query, category);
        }

        console.log(`Successfully processed ${mappedResults.length} results`);
        return mappedResults;

    } catch (error) {
        console.error('Gemini API Error:', error.message);
        
        // Return appropriate fallback based on error type
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.log("Timeout error, using fallback response");
        } else {
            console.log("API error, using fallback response");
        }
        
        return createFallbackResponse(query, category);
    }
}

module.exports = {
    fetchAndProcessGeminiResults
};