// functions/geminiService.js
const axios = require('axios');
const { isFoodItem, isLiquorType, isFlavoredLiquor, isShooterQuery } = require('./constants');

// Constants
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

// Common home bar ingredients to promote in recipes
const COMMON_INGREDIENTS = [
    // Base spirits
    'vodka', 'rum', 'gin', 'whiskey', 'tequila',
    // Mixers & juices
    'lemon juice', 'lime juice', 'orange juice', 'cranberry juice', 'pineapple juice', 'tomato juice',
    // Syrups & sweeteners
    'simple syrup', 'grenadine', 'honey', 'maple syrup',
    // Sodas & mixers
    'club soda', 'tonic water', 'ginger beer', 'cola', 'sprite', '7up',
    // Common garnishes
    'lemon', 'lime', 'orange', 'cherry', 'mint', 'olives',
    // Basic bitters (only when essential)
    'angostura bitters', 'orange bitters'
];

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

// Add randomization to prevent same responses
function getRandomVariation() {
    const variations = [
        "Create a unique variation",
        "Suggest a modern twist on",
        "Provide a creative take on",
        "Give me an interesting version of",
        "Show me a premium recipe for",
        "What's a great way to make"
    ];
    return variations[Math.floor(Math.random() * variations.length)];
}

function getRandomStyle() {
    const styles = [
        "classic style",
        "modern mixology approach", 
        "craft cocktail style",
        "bartender's choice",
        "premium version",
        "traditional method"
    ];
    return styles[Math.floor(Math.random() * styles.length)];
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

// Enhanced prompts with more variety and better structure
const getClassicCocktailPrompt = (query) => {
    const variation = getRandomVariation();
    const style = getRandomStyle();
    const randomSeed = Math.floor(Math.random() * 1000);
    
    return `
${variation} a "${query}" cocktail using ${style}. Use common household ingredients - no specialty liqueurs unless absolutely essential (like bitters for Old Fashioned).

Return JSON array format:
[{"title": "Name of Cocktail", "snippet": "Ingredients: 2 oz spirit, 1 oz mixer, 0.5 oz syrup. Instructions: detailed method with shaking/stirring, garnish, glassware.", "filePath": null, "why": "reasoning"}]

Requirements:
- Include ALL ingredient measurements (oz, ml, dashes, etc.)  
- Use common ingredients: lemon/lime juice, simple syrup, club soda, grenadine, common bitters
- Avoid specialty liqueurs unless recipe demands it
- Include glassware and garnish details
- Make it unique (seed: ${randomSeed})
- Ensure valid JSON structure`;
};

const getShooterPrompt = (query) => {
    const randomSeed = Math.floor(Math.random() * 1000);
    
    return `
Create a shooter recipe for "${query}" using common home bar ingredients. Keep it simple and accessible.

Return JSON array:
[{"title": "Shot Name", "snippet": "Ingredients: 0.5 oz ingredient1, 0.5 oz ingredient2, splash of ingredient3. Instructions: layer/mix method, serve immediately.", "filePath": null, "why": "perfect shooter"}]

Focus on:
- Exact measurements for shooter portions
- Common ingredients: vodka, rum, whiskey, cranberry juice, lime juice, grenadine
- Simple layering or mixing technique
- Bold flavors that work in small portions
- Unique variation (seed: ${randomSeed})
- Valid JSON only`;
};

const getFoodPairingPrompt = (query) => {
    const randomSeed = Math.floor(Math.random() * 1000);
    
    return `
Recommend a specific cocktail or wine pairing for "${query}" using common home bar ingredients. Focus on flavor harmony and complementary elements.

Return JSON array:
[{"title": "Perfect Pairing for ${query}", "snippet": "Pairing: specific drink name. Ingredients: detailed list with measurements using common ingredients. Instructions: preparation method. Why it works: flavor explanation.", "filePath": "willowpark.net", "why": "expert pairing"}]

Include:
- Specific drink recommendation with full recipe
- Use accessible ingredients: common spirits, citrus juices, simple syrup, club soda
- Explanation of flavor pairing principles  
- Complete ingredient measurements
- Unique suggestion (seed: ${randomSeed})
- Valid JSON structure`;
};

const getLiquorPrompt = (query) => {
    const variation = getRandomVariation();
    const randomSeed = Math.floor(Math.random() * 1000);
    
    return `
${variation} a cocktail featuring "${query}" as the main spirit using common home bar ingredients. Create something distinctive and well-balanced.

Return JSON array:
[{"title": "Signature ${query} Cocktail", "snippet": "Ingredients: 2 oz ${query}, additional common ingredients with measurements. Instructions: complete preparation method, garnish, serving style.", "filePath": null, "why": "showcases the spirit"}]

Requirements:
- Highlight the "${query}" spirit prominently
- Use accessible ingredients: citrus juices, simple syrup, club soda, ginger beer, grenadine, common fruits
- Include all measurements precisely
- Detailed preparation instructions
- Creative but balanced flavor profile  
- Unique creation (seed: ${randomSeed})
- Proper JSON format`;
};

const getCocktailPrompt = (query) => {
    const variation = getRandomVariation();
    const style = getRandomStyle();
    const randomSeed = Math.floor(Math.random() * 1000);
    
    return `
${variation} a cocktail inspired by "${query}" using ${style}. Use common home bar ingredients and be creative while maintaining balance.

Return JSON array:
[{"title": "Creative Cocktail Name", "snippet": "Ingredients: base spirit with measurement, common mixers with measurements, simple garnish. Instructions: step-by-step preparation, glassware, presentation.", "filePath": null, "why": "creative interpretation"}]

Focus on:
- Original cocktail creation using common ingredients
- Accessible ingredients: vodka, rum, whiskey, gin, citrus juices, simple syrup, club soda, tonic, ginger beer, cranberry juice
- Complete ingredient measurements  
- Detailed mixing instructions
- Thoughtful flavor combinations
- Unique approach (seed: ${randomSeed})
- Valid JSON structure`;
};

// Enhanced fallback with more variety
function createFallbackResponse(query, category = 'general') {
    const randomVariations = {
        food: [
            `Wine & Cocktail Pairing for ${query}`,
            `Perfect Drink Match for ${query}`, 
            `Beverage Harmony with ${query}`
        ],
        liquor: [
            `Signature ${query} Creation`,
            `Craft ${query} Cocktail`,
            `Premium ${query} Recipe`
        ],
        general: [
            `Mixologist's ${query} Special`,
            `Craft Cocktail: ${query} Inspired`,
            `Artisan ${query} Creation`
        ]
    };
    
    const titles = randomVariations[category] || randomVariations.general;
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    
    const fallbackData = {
        food: [{
            title: randomTitle,
            snippet: `A thoughtfully selected beverage that complements ${query}. The pairing enhances both the food and drink experience through balanced flavors and complementary aromatics.`,
            filePath: "willowpark.net",
            why: "Professional pairing recommendation based on flavor harmony."
        }],
        liquor: [{
            title: randomTitle,
            snippet: `Ingredients: 2 oz ${query}, 0.75 oz fresh citrus, 0.5 oz premium syrup, garnish. Instructions: Combine ingredients in shaker with ice, shake vigorously, strain into chilled glass, garnish appropriately.`,
            filePath: null,
            why: "Classic preparation method showcasing the spirit's character."
        }],
        general: [{
            title: randomTitle,
            snippet: `Ingredients: Premium base spirit, quality mixers, fresh garnish. Instructions: Expert preparation technique ensuring optimal flavor balance and presentation. Served in appropriate glassware.`,
            filePath: null,
            why: "Expert mixologist recommendation crafted for optimal experience."
        }]
    };
    
    return fallbackData[category] || fallbackData.general;
}

// Main Function with enhanced settings
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

    console.log(`Query Analysis - "${query}": classic=${isClassicCocktail}, food=${isFood}, liquor=${isLiquor}, flavored=${isFlavoredFromList}, shooter=${isShooter}`);

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

    // Enhanced API Request with better settings for variety
    const requestBody = {
        contents: [{
            parts: [{
                text: promptText
            }]
        }],
        generationConfig: {
            temperature: 0.7,        // Increased for more variety
            topK: 40,               // Allow more creative options
            topP: 0.8,              // Better balance of creativity and coherence
            maxOutputTokens: 1024,   // More space for detailed recipes
            candidateCount: 1        // Single response for consistency
        }
    };

    try {
        console.log("Sending request to Gemini API with enhanced settings...");
        
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
            console.log("No valid results, using enhanced fallback");
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