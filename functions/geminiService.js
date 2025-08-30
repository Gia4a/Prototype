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

// More robust JSON extraction and parsing
function extractAndParseJSON(responseText) {
    console.log("Raw response length:", responseText.length);
    console.log("Raw response preview:", responseText.substring(0, 200) + "...");
    
    try {
        // Step 1: Remove markdown code blocks
        let cleanText = responseText.replace(/```(?:json|JSON)?\s*([\s\S]*?)\s*```/g, '$1');
        
        // Step 2: Find JSON boundaries
        let startIdx = cleanText.indexOf('[');
        let endIdx = cleanText.lastIndexOf(']');
        
        // If no array, look for object
        if (startIdx === -1) {
            startIdx = cleanText.indexOf('{');
            endIdx = cleanText.lastIndexOf('}');
        }
        
        if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
            throw new Error('No valid JSON structure found');
        }
        
        // Step 3: Extract JSON portion
        cleanText = cleanText.substring(startIdx, endIdx + 1);
        
        // Step 4: Try parsing as-is first
        try {
            const directParse = JSON.parse(cleanText);
            console.log("Direct parse successful");
            return Array.isArray(directParse) ? directParse : [directParse];
        } catch (directError) {
            console.log("Direct parse failed, attempting cleanup:", directError.message);
        }
        
        // Step 5: Aggressive cleanup for malformed JSON
        cleanText = cleanText
            // Remove trailing commas
            .replace(/,(\s*[}\]])/g, '$1')
            // Fix unquoted keys
            .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
            // Handle unescaped quotes in values
            .replace(/:\s*"([^"]*)"([^"]*)"([^"]*?)"\s*([,}\]])/g, ':"$1\\"$2\\"$3"$4')
            // Fix values that should be quoted
            .replace(/:\s*([^",\[\]{}]+?)(\s*[,}\]])/g, (match, value, ending) => {
                const trimmed = value.trim();
                // Don't quote numbers, booleans, null, or already quoted strings
                if (/^(-?\d+\.?\d*|true|false|null|".*")$/.test(trimmed)) {
                    return ':' + trimmed + ending;
                }
                // Quote and escape other values
                return ':"' + trimmed.replace(/"/g, '\\"') + '"' + ending;
            });
        
        console.log("Cleaned JSON (first 200 chars):", cleanText.substring(0, 200));
        
        const parsed = JSON.parse(cleanText);
        return Array.isArray(parsed) ? parsed : [parsed];
        
    } catch (error) {
        console.error("All parsing attempts failed:", error.message);
        console.error("Original text length:", responseText.length);
        
        // Extract any readable information for fallback
        const titleMatch = responseText.match(/"title":\s*"([^"]+)"/i);
        const snippetMatch = responseText.match(/"snippet":\s*"([^"]+)"/i);
        
        return [{
            title: titleMatch ? titleMatch[1] : "Mixologist Suggestion",
            snippet: snippetMatch ? snippetMatch[1] : "I encountered an issue processing your request. Please try a different search term.",
            filePath: null,
            why: "Response reconstructed from partial data due to parsing error."
        }];
    }
}

// Simplified, more reliable prompts
const getClassicCocktailPrompt = (query) => `
Return a JSON array with the traditional recipe for "${query}". Use this exact format:

[{"title": "Classic ${query}", "snippet": "Ingredients: 2 oz spirit, mixers. Instructions: method.", "filePath": null, "why": "Traditional recipe"}]

Keep ingredients and instructions concise. Ensure valid JSON.`;

const getShooterPrompt = (query) => `
Return a JSON array with shooter recipes for "${query}". Use this exact format:

[{"title": "${query} Shot", "snippet": "Ingredients: list. Instructions: method.", "filePath": null, "why": "Easy shooter"}]

Use common ingredients only. Ensure valid JSON.`;

const getFoodPairingPrompt = (query) => `
Return a JSON array with beverage pairings for "${query}". Use this exact format:

[{"title": "Wine for ${query}", "snippet": "Pairing Notes: wine recommendation. Serving: details.", "filePath": "willowpark.net", "why": "Complementary pairing"}]

Keep descriptions concise. Ensure valid JSON.`;

const getLiquorPrompt = (query) => `
Return a JSON array with cocktails using "${query}". Use this exact format:

[{"title": "${query} Cocktail", "snippet": "Ingredients: list. Instructions: method.", "filePath": null, "why": "Classic cocktail"}]

Use simple ingredients. Ensure valid JSON.`;

const getCocktailPrompt = (query) => `
Return a JSON array with cocktail suggestions for "${query}". Use this exact format:

[{"title": "Custom ${query}", "snippet": "Ingredients: list. Instructions: method.", "filePath": null, "why": "Creative suggestion"}]

Keep it simple. Ensure valid JSON.`;

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

    // API Request with very conservative settings for reliable JSON
    const requestBody = {
        contents: [{
            parts: [{
                text: promptText
            }]
        }],
        generationConfig: {
            temperature: 0.1,      // Very low for maximum consistency
            topK: 1,              // Most predictable output
            topP: 0.1,            // Minimal creativity
            maxOutputTokens: 512   // Shorter to avoid truncation
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