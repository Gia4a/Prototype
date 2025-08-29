// functions/geminiService.js
const axios = require('axios');
const { isFoodItem, isLiquorType, isFlavoredLiquor, isShooterQuery } = require('./constants');

// Constants
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const CLASSIC_COCKTAILS = [
    'moscow mule', 'old fashioned', 'manhattan', 'martini', 'margarita', 
    'mojito', 'daiquiri', 'whiskey sour', 'cosmopolitan', 'mai tai',
    'piña colada', 'bloody mary', 'mimosa', 'negroni', 'aperol spritz',
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

// Classic cocktail prompt - STRICT and direct
const getClassicCocktailPrompt = (query) => `STRICT INSTRUCTION: Provide ONLY the standard, traditional recipe for "${query}". No creativity, no variations, no elevations - just the classic recipe that every bartender knows.

You must return exactly this JSON format with NO additional text:

[
  {
    "title": "Classic ${query}",
    "snippet": "Ingredients: [exact traditional recipe]. Instructions: [standard method].",
    "filePath": null,
    "why": "This is the standard ${query} recipe."
  },
  {
    "title": "${query} - Easy Version",
    "snippet": "Ingredients: [same recipe with convenience store substitutes]. Instructions: [same method].",
    "filePath": null,
    "why": "Same recipe using easily available ingredients."
  }
]

FOR MOSCOW MULE SPECIFICALLY:
- Classic: 2 oz vodka, 4-6 oz ginger beer, 0.5 oz lime juice, lime wedge
- Method: Build in copper mug with ice, stir gently
- Easy version: Use ginger ale instead of ginger beer, bottled lime juice

DO NOT add creative language, elevated descriptions, or variations. Just provide the standard recipe exactly as written in cocktail recipe books.`;

// Enhanced JSON parsing function
function extractAndParseJSON(responseText) {
    console.log("Attempting to parse response:", responseText);
    
    // Remove any markdown code blocks
    let cleanText = responseText.replace(/```json\s*([\s\S]*?)\s*```/g, '$1');
    cleanText = cleanText.replace(/```\s*([\s\S]*?)\s*```/g, '$1');
    
    // Try to find JSON array in the text - more flexible regex
    const jsonArrayRegex = /\[\s*\{[\s\S]*?\}\s*(?:,\s*\{[\s\S]*?\}\s*)*\]/;
    const match = cleanText.match(jsonArrayRegex);
    
    if (match) {
        cleanText = match[0];
    } else {
        // If no array found, try to find the start of JSON and extract everything from there
        const startIndex = cleanText.indexOf('[');
        const endIndex = cleanText.lastIndexOf(']');
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            cleanText = cleanText.substring(startIndex, endIndex + 1);
        }
    }
    
    // Clean up common issues
    cleanText = cleanText.trim();
    cleanText = cleanText.replace(/,\s*\]/g, ']'); // Remove trailing commas
    cleanText = cleanText.replace(/,\s*\}/g, '}'); // Remove trailing commas in objects
    
    // Fix common JSON issues
    cleanText = cleanText.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":'); // Add quotes to unquoted keys
    cleanText = cleanText.replace(/:\s*([^",\[\]{}]+)(\s*[,}])/g, ':"$1"$2'); // Add quotes to unquoted string values
    
    console.log("Cleaned text for parsing:", cleanText);
    
    return JSON.parse(cleanText);
}

// Shooter prompt
const getShooterPrompt = (query) => `You are a Creative Mixologist and AI Assistant, an expert in crafting exciting and delicious shooters using only common ingredients.
Your goal is to provide two distinct shooter recipes that can be made with ingredients from a convenience store like 7-Eleven.

For the query "${query}":

**CRITICAL CONSTRAINTS:**
- **Ingredients MUST be available at a 7-Eleven or a basic convenience store.** This means only common spirits, mixers (soda, juice), and basic fruits.
- **NO specialty ingredients.** No bitters, complex syrups, or rare liqueurs.

**CRITICAL: Your response must be ONLY a valid JSON array with this exact structure:**
[
  {
    "title": "Classic & Simple: ${query}",
    "snippet": "A straightforward and popular recipe. Ingredients: [list with measurements]. Instructions: [step-by-step].",
    "filePath": null,
    "why": "This is a great starting point because..."
  },
  {
    "title": "Creative Twist: ${query}",
    "snippet": "A more unique and adventurous recipe. Ingredients: [list with measurements]. Instructions: [step-by-step].",
    "filePath": null,
    "why": "If you're feeling adventurous, this combination offers..."
  }
]

**Requirements:**
- Create one simple, well-known shooter and one more creative (but still accessible) option.
- Use only basic, common ingredients found at a 7-Eleven.
- Provide clear, concise instructions.
- Keep snippets under 80 words.`;

const getFoodPairingPrompt = (query) => `You are a sommelier and beverage expert with access to willowpark.net catalog. Provide exactly 3 beverage pairings for "${query}": one wine, one cocktail/spirit, and one craft beer.

**CRITICAL: Your response must be ONLY a valid JSON array with exactly 3 objects:**
[
  {
    "title": "[Specific Wine Name] - Wine Pairing for ${query.toLowerCase()}",
    "snippet": "Pairing Notes: [Detailed explanation of why this wine complements the food, including flavor interactions]. Serving Suggestion: [Temperature, glassware, and serving notes].",
    "filePath": "willowpark.net",
    "why": "Wine pairing selected for its complementary flavor profile and ability to enhance the dining experience."
  },
  {
    "title": "[Specific Spirit/Cocktail Name] - Spirit Pairing for ${query.toLowerCase()}",
    "snippet": "Pairing Notes: [Detailed explanation of how the spirit's characteristics work with the food]. Serving Suggestion: [How to serve - neat, on rocks, or as cocktail].",
    "filePath": "willowpark.net",
    "why": "Spirit pairing chosen for its ability to cleanse the palate and complement the dish's flavors."
  },
  {
    "title": "[Specific Beer Name] - Beer Pairing for ${query.toLowerCase()}",
    "snippet": "Pairing Notes: [Detailed explanation of how beer style complements the food]. Serving Suggestion: [Temperature and glassware recommendations].",
    "filePath": "willowpark.net",
    "why": "Beer pairing selected for its ability to cut through richness and enhance flavor complexity."
  }
]

**Requirements:**
- Use specific product names that could be found at willowpark.net
- Each pairing note must be detailed and explain WHY the pairing works
- Include proper serving suggestions for each beverage
- Focus on how each beverage interacts with the specific food item`;

const getLiquorPrompt = (query) => `You are a Creative Mixologist and AI Assistant, with deep knowledge of spirits and cocktails made from simple ingredients.
Your goal is to provide two excellent cocktail recipes for a given liquor using only ingredients from a convenience store like 7-Eleven.

For the liquor "${query}", provide two cocktail recommendations.

**Response format (JSON array only):**
[
  {
    "title": "The Classic: [Cocktail Name]",
    "snippet": "A timeless recipe that showcases the spirit. Ingredients: [with measurements]. Instructions: [method].",
    "filePath": null,
    "why": "This is an essential cocktail for any ${query} lover because..."
  },
  {
    "title": "The Creative Twist: [Cocktail Name]",
    "snippet": "A modern take that offers a new experience. Ingredients: [with measurements]. Instructions: [method].",
    "filePath": null,
    "why": "This drink is a great way to explore a different side of ${query} by..."
  }
]`;

const getCocktailPrompt = (query) => `You are a Creative Mixologist and AI Assistant, specializing in crafting unique drinks for any occasion using simple, accessible ingredients.
Your goal is to interpret a user's request and provide two relevant cocktail recipes using only items from a convenience store like 7-Eleven.

For the cocktail-related query "${query}", provide two inspired recommendations.

**Response format (JSON array only):**
[
  {
    "title": "Direct Interpretation: [Cocktail Name]",
    "snippet": "Concept: [How this drink fits the query]. Ingredients: [with measurements]. Method: [preparation].",
    "filePath": null,
    "why": "This is a great choice because..."
  },
  {
    "title": "Creative Interpretation: [Cocktail Name]",
    "snippet": "Concept: [A more abstract or creative take on the query]. Ingredients: [with measurements]. Method: [preparation].",
    "filePath": null,
    "why": "If you want to try something different, this is perfect because..."
  }
]`;

// Fallback function for food pairings when JSON parsing fails
function createFallbackFoodPairing(query) {
    const foodName = query.toLowerCase();
    return [
        {
            title: `Premium Wine Pairing - Wine Pairing for ${foodName}`,
            snippet: `Pairing Notes: A carefully selected wine that complements the flavors and richness of ${foodName}. The wine's characteristics enhance the dining experience through balanced acidity and complementary flavor notes. Serving Suggestion: Serve at optimal temperature in appropriate glassware.`,
            filePath: "willowpark.net",
            why: "Wine pairing selected for its complementary flavor profile and ability to enhance the dining experience."
        },
        {
            title: `Craft Cocktail Pairing - Spirit Pairing for ${foodName}`,
            snippet: `Pairing Notes: A thoughtfully crafted cocktail or premium spirit that provides a perfect counterpoint to ${foodName}. The spirit's characteristics cleanse the palate while enhancing the overall flavor experience. Serving Suggestion: Served according to traditional preparation methods.`,
            filePath: "willowpark.net", 
            why: "Spirit pairing chosen for its ability to cleanse the palate and complement the dish's flavors."
        },
        {
            title: `Artisan Beer Pairing - Beer Pairing for ${foodName}`,
            snippet: `Pairing Notes: A carefully selected craft beer that cuts through richness while complementing the flavors of ${foodName}. The beer's carbonation and hop character provide the perfect balance to enhance your meal. Serving Suggestion: Served chilled in appropriate glassware.`,
            filePath: "willowpark.net",
            why: "Beer pairing selected for its ability to cut through richness and enhance flavor complexity."
        }
    ];
}

// Main Function
async function fetchAndProcessGeminiResults(query, apiKey) {
    if (!apiKey) {
        throw new Error('API key for Gemini service is not configured.');
    }

    // Query Detection - Check for classic cocktails first
    const isClassicCocktail = isClassicCocktailRequest(query);
    const isFood = isFoodItem(query);
    const isLiquor = isLiquorType(query);
    const isFlavoredFromList = isFlavoredLiquor(query);
    const isShooter = isShooterQuery(query);

    console.log(`Query: "${query}"`);
    console.log(`isClassicCocktail: ${isClassicCocktail}`);
    console.log(`isFood: ${isFood}`);
    console.log(`isLiquor: ${isLiquor}`);
    console.log(`isShooter: ${isShooter}`);

    // Determine prompt based on query type - CLASSIC COCKTAILS GET PRIORITY
    let promptText = '';
    let useReducedRandomness = false;

    if (isClassicCocktail) {
        console.log("Using classic cocktail prompt");
        promptText = getClassicCocktailPrompt(query);
        useReducedRandomness = true;
    } else if (isShooter) {
        console.log("Using shooter prompt");
        promptText = getShooterPrompt(query);
        useReducedRandomness = false;
    } else if (isFood) {
        console.log("Using food pairing prompt");
        promptText = getFoodPairingPrompt(query);
        useReducedRandomness = false;
    } else if (isLiquor || isFlavoredFromList) {
        console.log("Using liquor prompt");
        promptText = getLiquorPrompt(query);
        useReducedRandomness = false;
    } else {
        console.log("Using general cocktail prompt");
        promptText = getCocktailPrompt(query);
        useReducedRandomness = false;
    }

    // API Request Configuration - REDUCE RANDOMNESS FOR CLASSIC COCKTAILS
    const requestBody = {
        contents: [{
            parts: [{
                text: promptText
            }]
        }],
        generationConfig: useReducedRandomness ? {
            temperature: 0.1,  // Very low for maximum consistency
            topK: 5,          // Very low for most predictable results
            topP: 0.7,        // Lower for focused responses
            maxOutputTokens: 1024  // Shorter responses for simple recipes
        } : {
            temperature: 1.0,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048
        }
    };

    try {
        const geminiResponse = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        console.log("Raw Gemini API Response:", geminiResponse.data);

        let resultsFromApi = [];
        if (geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const responseText = geminiResponse.data.candidates[0].content.parts[0].text;

            try {
                resultsFromApi = extractAndParseJSON(responseText);
                console.log("Parsed Data:", resultsFromApi);
            } catch (error) {
                console.error("Error parsing Gemini response:", error.message);
                console.error("Original responseText:", responseText);
                throw new Error('Failed to parse Gemini API response JSON.');
            }
        } else {
            throw new Error('No valid content returned from Gemini API.');
        }
        
        const mappedResults = resultsFromApi.map((item, index) => ({
            id: item.id || `gemini-result-${index}-${Date.now()}`,
            title: item.title || 'Untitled Result',
            filePath: item.filePath || item.file_path,
            snippet: item.snippet || 'No snippet available.'
        }));

        return mappedResults;

    } catch (error) {
        console.error('Error calling Gemini API:', error.message);
        throw error;
    }
}

module.exports = {
    fetchAndProcessGeminiResults
};