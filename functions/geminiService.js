// functions/geminiService.js
const axios = require('axios');
const { isFoodItem, isLiquorType, isFlavoredLiquor, isShooterQuery, FLAVORED_LIQUORS, LIQUOR_TYPES } = require('./constants');

// Constants
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

// Season helpers
function getCurrentSeason() {
    const month = new Date().getMonth(); // 0-indexed (0 = January, 11 = December)
    if (month >= 2 && month <= 4) { // March, April, May
        return 'spring';
    } else if (month >= 5 && month <= 7) { // June, July, August
        return 'summer';
    } else if (month >= 8 && month <= 10) { // September, October, November
        return 'fall';
    } else { // December, January, February
        return 'winter';
    }
}

// Theme detection for special occasions
function getCurrentTheme() {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed
    const day = now.getDate();
    
    // Halloween (October)
    if (month === 9) return { 
        name: 'Halloween', 
        ingredients: 'spiced rum, apple cider, cinnamon whiskey',
        mention: 'Perfect for Halloween parties'
    };
    
    // Christmas (December)
    if (month === 11) return { 
        name: 'Christmas', 
        ingredients: 'cranberry juice, pomegranate juice, cinnamon',
        mention: 'Perfect for holiday celebrations'
    };
    
    // Valentine's Day (February)
    if (month === 1) return { 
        name: 'Valentine\'s', 
        ingredients: 'strawberry vodka, cherry juice, pink drinks',
        mention: 'Perfect for romantic occasions'
    };
    
    // Mother's Day (May - 2nd Sunday, approx May 8-14)
    if (month === 4 && day >= 8 && day <= 14) return { 
        name: 'Mother\'s Day', 
        ingredients: 'elderflower liqueur, peach schnapps, floral elements',
        mention: 'Perfect for Mother\'s Day celebrations'
    };
    
    // Father's Day (June - 3rd Sunday, approx June 15-21)
    if (month === 5 && day >= 15 && day <= 21) return { 
        name: 'Father\'s Day', 
        ingredients: 'bourbon, whiskey, maple syrup',
        mention: 'Perfect for Father\'s Day celebrations'
    };
    
    // Labor Day (September - 1st Monday, approx Sept 1-7)
    if (month === 8 && day <= 7) return { 
        name: 'Labor Day', 
        ingredients: 'classic American spirits, cola mixers',
        mention: 'Perfect for Labor Day gatherings'
    };
    
    // Breast Cancer Awareness (October - alternative to Halloween)
    if (month === 9 && Math.random() > 0.5) return { 
        name: 'Pink Ribbon', 
        ingredients: 'pink grapefruit juice, strawberry, rosÃ© wine',
        mention: 'Supporting breast cancer awareness'
    };
    
    // Default to bold/flavored for non-themed times
    return { 
        name: 'Bold', 
        ingredients: 'flavored vodka, tropical liqueurs, unique mixers',
        mention: 'For adventurous drinkers'
    };
}

// Seasonal fruit juices
const SEASONAL_FRUIT_JUICES = {
    spring: ['strawberry juice', 'rhubarb juice', 'elderflower cordial', 'fresh lemon juice with mint'],
    summer: ['watermelon juice', 'peach nectar', 'fresh berry juice', 'pineapple juice', 'mango juice'],
    fall: ['apple cider', 'cranberry juice', 'pomegranate juice', 'pear juice'],
    winter: ['blood orange juice', 'grapefruit juice', 'pomegranate juice', 'spiced apple cider']
};

// Specialty liqueurs for home bar
const SPECIALTY_LIQUEURS = [
    'elderflower liqueur', 'amaretto', 'triple sec', 'peach schnapps', 
    'coconut rum', 'vanilla vodka', 'cinnamon whiskey', 'honey bourbon'
];

// Classic cocktails list
const CLASSIC_COCKTAILS = [
    'moscow mule', 'old fashioned', 'manhattan', 'martini', 'margarita', 
    'mojito', 'daiquiri', 'whiskey sour', 'cosmopolitan', 'mai tai',
    'pina colada', 'bloody mary', 'mimosa', 'negroni', 'aperol spritz',
    'gin and tonic', 'vodka tonic', 'rum and coke', 'cuba libre',
    'long island iced tea', 'amaretto sour', 'white russian', 'black russian',
    'screwdriver', 'tom collins', 'john collins', 'mint julep', 'sazerac'
];

// Common kitchen ingredients for mixers and garnishes
const KITCHEN_MIXERS = [
    'lemon juice', 'lime juice', 'orange juice', 'grapefruit juice',
    'simple syrup', 'honey', 'maple syrup', 'sugar',
    'club soda', 'tonic water', 'ginger beer', 'cola', 'sprite',
    'cranberry juice', 'pineapple juice', 'tomato juice',
    'lemon', 'lime', 'orange', 'cherry', 'mint', 'salt', 'black pepper'
];

// Specialty items only for authentic classic cocktails
const SPECIALTY_CLASSIC_INGREDIENTS = {
    'old fashioned': ['angostura bitters'],
    'manhattan': ['sweet vermouth', 'angostura bitters'],
    'martini': ['dry vermouth', 'olives'],
    'negroni': ['campari', 'sweet vermouth'],
    'sazerac': ['absinthe', 'peychauds bitters'],
    'aviation': ['maraschino liqueur', 'crÃ¨me de violette'],
    'last word': ['green chartreuse', 'maraschino liqueur']
};

// Helper functions
function getRandomSeasonalJuice(season) {
    const seasonalJuices = SEASONAL_FRUIT_JUICES[season] || SEASONAL_FRUIT_JUICES.summer;
    return seasonalJuices[Math.floor(Math.random() * seasonalJuices.length)];
}

function getRandomFlavoredSpirit() {
    return FLAVORED_LIQUORS[Math.floor(Math.random() * FLAVORED_LIQUORS.length)];
}

function getRandomSpecialtyLiqueur() {
    return SPECIALTY_LIQUEURS[Math.floor(Math.random() * SPECIALTY_LIQUEURS.length)];
}

function isClassicCocktailRequest(query) {
    const normalizedQuery = query.toLowerCase().trim();
    return CLASSIC_COCKTAILS.some(cocktail => 
        normalizedQuery === cocktail || 
        normalizedQuery === cocktail + ' recipe' ||
        normalizedQuery.startsWith(cocktail + ' ') ||
        normalizedQuery.endsWith(' ' + cocktail)
    );
}

function getRandomCocktailForSpirit(spirit) {
    const cocktailNames = [
        'Twilight', 'Sunset', 'Garden', 'Storm', 'Breeze', 'Fizz', 'Splash', 'Mist',
        'Cooler', 'Spritz', 'Punch', 'Smash', 'Sour', 'Collins', 'Mule', 'Rickey'
    ];
    const randomName = cocktailNames[Math.floor(Math.random() * cocktailNames.length)];
    return `${spirit.charAt(0).toUpperCase() + spirit.slice(1)} ${randomName}`;
}

// JSON extraction and parsing
function extractAndParseJSON(responseText) {
    console.log("Raw response length:", responseText.length);
    console.log("Raw response preview:", responseText.substring(0, 200) + "...");
    
    try {
        // Remove markdown code blocks
        let cleanText = responseText.replace(/```(?:json|JSON)?\s*([\s\S]*?)\s*```/g, '$1');
        
        // Find JSON boundaries
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
        
        // Extract JSON portion
        cleanText = cleanText.substring(startIdx, endIdx + 1);
        
        // Try parsing as-is first
        try {
            const directParse = JSON.parse(cleanText);
            console.log("Direct parse successful");
            return Array.isArray(directParse) ? directParse : [directParse];
        } catch (directError) {
            console.log("Direct parse failed, attempting cleanup:", directError.message);
        }
        
        // Cleanup for malformed JSON
        cleanText = cleanText
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Fix unquoted keys
            .replace(/:\s*([^",\[\]{}]+?)(\s*[,}\]])/g, (match, value, ending) => {
                const trimmed = value.trim();
                if (/^(-?\d+\.?\d*|true|false|null|".*")$/.test(trimmed)) {
                    return ':' + trimmed + ending;
                }
                return ':"' + trimmed.replace(/"/g, '\\"') + '"' + ending;
            });
        
        const parsed = JSON.parse(cleanText);
        return Array.isArray(parsed) ? parsed : [parsed];
        
    } catch (error) {
        console.error("JSON parsing failed:", error.message);
        
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

// Prompt functions
const getClassicCocktailPrompt = (query) => {
    const randomSeed = Math.floor(Math.random() * 1000);
    const specialtyItems = SPECIALTY_CLASSIC_INGREDIENTS[query.toLowerCase()] || [];
    const allowedSpecialty = specialtyItems.length > 0 ? `You may use these specialty items for authenticity: ${specialtyItems.join(', ')}` : '';
    const currentSeason = getCurrentSeason();
    const seasonalJuice = getRandomSeasonalJuice(currentSeason);
    const theme = getCurrentTheme();
    
    return `
Return a JSON array with exactly 2 cocktail recipes for the classic "${query}":

INGREDIENT RESTRICTIONS:
- Maximum 3 total between spirits and liqueurs combined
- Use 1-2 spirits, 0-2 liqueurs
- For mixers/garnishes: ONLY common kitchen ingredients: ${KITCHEN_MIXERS.join(', ')}
- ${allowedSpecialty}
- OPTIONAL: Consider seasonal fruit juice (${seasonalJuice}) if it enhances the cocktail
- Always include "oz" in measurements

Format:
[
    {
        "title": "Classic ${query}",
        "snippet": "Ingredients: [authentic classic recipe with exact measurements including 'oz']. Instructions: [traditional method]",
        "filePath": null,
        "why": "authentic classic recipe",
        "hasUpgrade": true
    },
    {
        "title": "${theme.name} ${query} Special",
        "snippet": "Ingredients: [classic base with ${theme.ingredients}, optional seasonal juice if it enhances, measurements with 'oz']. Instructions: [enhanced method]. Theme: ${theme.mention}",
        "filePath": null,
        "why": "${theme.name.toLowerCase()} themed upgrade",
        "hasUpgrade": false
    }
]

CRITICAL: First recipe must be authentic classic ${query}. Second uses themed ingredients: ${theme.ingredients}. Seasonal juice is OPTIONAL.
Seed: ${randomSeed}
`;
};

const getShooterPrompt = (query) => {
    const randomSeed = Math.floor(Math.random() * 1000);
    const randomFlavoredSpirit = getRandomFlavoredSpirit();
    
    return `
Create a shooter recipe for "${query}" using flavored spirits and liqueurs.

Return JSON array:
[{"title": "${query} Shot", "snippet": "Ingredients: 0.5 oz ${randomFlavoredSpirit}, 0.5 oz [complementary liqueur], dash of [mixer]. Instructions: [method - shake/layer/build], serve immediately in shot glass.", "filePath": null, "why": "perfect ${query}-inspired shooter", "hasUpgrade": false}]

Requirements:
- Use flavored spirits like: ${FLAVORED_LIQUORS.slice(0, 8).join(', ')}
- Exact measurements including "oz" (0.5 oz, 0.25 oz, dash, etc.)
- Bold flavors that work in small portions
- Simple preparation method
- Unique variation (seed: ${randomSeed})
- Valid JSON only`;
};

const getFoodPairingPrompt = (query) => {
    const randomSeed = Math.floor(Math.random() * 1000);
    const currentSeason = getCurrentSeason();
    const seasonalJuice = getRandomSeasonalJuice(currentSeason);
    
    return `
Create comprehensive beverage pairings for "${query}".

Return JSON array with 3 pairing options:
[{"title": "Perfect Pairings for ${query}",
    "snippet": "Wine Pairing: [specific wine name]. Wine Notes: [detailed explanation why this wine works with ${query}, include flavor profiles and how they complement the dish]. Spirit Pairing: [specific cocktail or spirit]. Spirit Notes: [detailed explanation of the spirit pairing, include preparation if cocktail]. Beer Pairing: [specific beer style/name]. Beer Notes: [detailed explanation of beer pairing with ${query}].",
    "filePath": "willowpark.net",
    "why": "comprehensive beverage pairing guide",
    "hasUpgrade": false,
    "winePairing": {
        "name": "[specific wine name]",
        "notes": "[detailed wine pairing explanation]"
    },
    "spiritPairing": {
        "name": "[specific cocktail or spirit name]", 
        "notes": "[detailed spirit pairing explanation with preparation if cocktail]"
    },
    "beerPairing": {
        "name": "[specific beer name or style]",
        "notes": "[detailed beer pairing explanation]"
    }
}]

Requirements:
- Consider ${query}'s flavor profile, cooking method, and texture
- Wine: suggest specific variety, explain acidity/tannin/flavor interactions
- Spirit: can be neat spirit, cocktail with recipe, or mixed drink
- Beer: specific style or brand, explain hop/malt/yeast characteristics
- Each pairing note should be 2-3 sentences explaining WHY it works
- Consider ${currentSeason} seasonal appropriateness
- Unique recommendations (seed: ${randomSeed})
- Valid JSON structure only`;
};

const getLiquorPrompt = (query) => {
    const randomSeed = Math.floor(Math.random() * 1000);
    const randomCocktailName = getRandomCocktailForSpirit(query);
    const currentSeason = getCurrentSeason();
    const seasonalJuice = getRandomSeasonalJuice(currentSeason);
    const specialtyLiqueur = getRandomSpecialtyLiqueur();
    const theme = getCurrentTheme();
    
    return `
Return a JSON array with exactly 2 cocktail recipes featuring "${query}" as the main spirit:

INGREDIENT RESTRICTIONS:
- Maximum 3 total between spirits and liqueurs combined
- Use 1-2 spirits (${query} must be primary), 0-2 liqueurs maximum
- OPTIONAL: Consider seasonal fruit juice (${seasonalJuice}) if it enhances the cocktail
- Consider flavored spirits and specialty liqueurs: ${specialtyLiqueur}
- Always include "oz" in measurements

Format:
[
  {
    "title": "Classic ${randomCocktailName}",
    "snippet": "Ingredients: [2 oz ${query}, optional seasonal juice if it enhances, simple mixers with exact measurements including 'oz']. Instructions: [complete method]",
    "filePath": null,
    "why": "classic ${query} cocktail",
    "hasUpgrade": true
  },
  {
    "title": "${theme.name} ${query} Special",
    "snippet": "Ingredients: [2 oz ${query}, themed ingredients like ${theme.ingredients}, optional seasonal juice if it enhances, measurements with 'oz']. Instructions: [bold method]. Theme: ${theme.mention}",
    "filePath": null,
    "why": "${theme.name.toLowerCase()} themed creation",
    "hasUpgrade": false
  }
]

CRITICAL: Use restrictions (max 3 spirits+liqueurs). Seasonal juice is OPTIONAL. Mention theme in second recipe.
Seed: ${randomSeed}
`;
};

const getCocktailPrompt = (query) => {
    const randomSeed = Math.floor(Math.random() * 1000);
    const currentSeason = getCurrentSeason();
    const seasonalJuice = getRandomSeasonalJuice(currentSeason);
    const randomFlavored = getRandomFlavoredSpirit();
    const randomSpecialty = getRandomSpecialtyLiqueur();
    const theme = getCurrentTheme();
    
    return `
Return a JSON array with exactly 2 cocktail recipes inspired by "${query}":

INGREDIENT RESTRICTIONS:
- Maximum 3 total between spirits and liqueurs combined
- Use 1-2 spirits, 0-2 liqueurs maximum
- OPTIONAL: Consider seasonal fruit juice (${seasonalJuice}) if it fits the cocktail concept
- Consider flavored spirits: ${randomFlavored}
- Consider specialty liqueurs: ${randomSpecialty}
- Always include "oz" in measurements

Format:
[
  {
    "title": "${query} Classic",
    "snippet": "Ingredients: [traditional interpretation with exact measurements including 'oz', optional seasonal juice if it enhances]. Instructions: [complete method]",
    "filePath": null,
    "why": "classic ${query} interpretation",
    "hasUpgrade": true
  },
  {
    "title": "${theme.name} ${query}",
    "snippet": "Ingredients: [bold version using ${theme.ingredients}, optional seasonal juice if it fits, measurements with 'oz']. Instructions: [enhanced method]. Theme: ${theme.mention}",
    "filePath": null,
    "why": "${theme.name.toLowerCase()} themed creation",
    "hasUpgrade": false
  }
]

CRITICAL: Follow restrictions (max 3 spirits+liqueurs). Seasonal juice is OPTIONAL. Mention theme in second recipe.
Seed: ${randomSeed}
`;
};

// Fallback responses
function createFallbackResponse(query, category = 'general') {
    const currentSeason = getCurrentSeason();
    const seasonalJuice = getRandomSeasonalJuice(currentSeason);
    const theme = getCurrentTheme();
    
    const fallbackData = {
        food: [{
            title: `Perfect Pairing for ${query}`,
            snippet: `Cocktail: Seasonal Spritz. Ingredients: 2 oz white wine, 1 oz elderflower liqueur, 0.5 oz lime juice, 2 oz club soda, lime wheel garnish. Instructions: Build over ice in wine glass, stir gently, garnish with lime. Pairing Notes: The crisp, clean flavors complement ${query} beautifully.`,
            filePath: "willowpark.net",
            why: "Professional pairing recommendation based on flavor harmony.",
            hasUpgrade: true
        }],
        liquor: [{
            title: `Classic ${query} Cocktail`,
            snippet: `Ingredients: 2 oz ${query}, 0.75 oz fresh lemon juice, 0.5 oz simple syrup, lemon twist garnish. Instructions: Combine all ingredients except garnish in shaker with ice, shake vigorously for 10 seconds, strain into chilled coupe glass, express lemon twist over drink and drop in.`,
            filePath: null,
            why: "Classic preparation showcasing the spirit's character.",
            hasUpgrade: true
        }],
        general: [{
            title: `${query} Inspired Cocktail`,
            snippet: `Ingredients: 2 oz vodka, 1 oz elderflower liqueur, 0.75 oz fresh lime juice, 0.5 oz simple syrup, 3 oz tonic water, cucumber wheel garnish. Instructions: Add spirits and citrus to shaker with ice, shake well, strain over fresh ice in highball glass, top with tonic, garnish with cucumber wheel.`,
            filePath: null,
            why: "Expert mixologist creation with balanced flavors.",
            hasUpgrade: true
        }]
    };
    
    return fallbackData[category] || fallbackData.general;
}

// Main function
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

    // API Request
    const requestBody = {
        contents: [{
            parts: [{
                text: promptText
            }]
        }],
        generationConfig: {
            temperature: 0.8,
            topK: 50,
            topP: 0.9,
            maxOutputTokens: 1024,
            candidateCount: 1
        }
    };

    try {
        console.log("Sending request to Gemini API...");
        
        const geminiResponse = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            requestBody,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
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
        let mappedResults = resultsFromApi.map((item, index) => ({
            id: item.id || `gemini-result-${index}-${Date.now()}`,
            title: item.title || `Recommendation ${index + 1}`,
            filePath: item.filePath || null,
            snippet: item.snippet || 'No details available.',
            hasUpgrade: item.hasUpgrade || false
        })).filter(result => result.title && result.snippet);

        // Attach enhancedComment for both classic and elevated (if present)
        if (mappedResults.length > 0) {
            // Try to get ingredients for each result (fallback to parsing snippet)
            const getIngredientsFromSnippet = (snippet) => {
                const match = snippet.match(/Ingredients?:\s*\[?([^\]]+)\]?/i);
                if (match && match[1]) {
                    return match[1].split(',').map(s => s.trim());
                }
                return [];
            };
            const season = getCurrentSeason();
            // Generate comments for both classic and elevated
            const commentPromises = mappedResults.map((result, idx) =>
                generateCocktailComment(
                    result.title,
                    getIngredientsFromSnippet(result.snippet),
                    season,
                    apiKey,
                    idx === 0 ? 'classic' : 'elevated'
                )
            );
            const comments = await Promise.all(commentPromises);
            mappedResults = mappedResults.map((result, idx) => ({
                ...result,
                enhancedComment: comments[idx]
            }));
        }

        // Ensure we always return at least one result
        if (mappedResults.length === 0) {
            console.log("No valid results, using fallback");
            return createFallbackResponse(query, category);
        }

        console.log(`Successfully processed ${mappedResults.length} results`);
        return mappedResults;

    } catch (error) {
        console.error('Gemini API Error:', error.message);
        return createFallbackResponse(query, category);
    }
}

// Enhanced cocktail comment generation - same comment for both versions
async function generateCocktailComment(cocktailName, ingredients, season, apiKey, recipeType = 'classic') {
    if (!apiKey) {
        throw new Error('API key for Gemini service is not configured.');
    }

    const currentSeason = season || getCurrentSeason();
    
    const promptText = `
Create a single poetic cocktail description for "${cocktailName}" that works for both classic and elevated versions.

Format as JSON:
{
    "poeticLine1": "First line: cocktail influencer tweet style, poetic idiom about this cocktail (100 characters max)",
    "poeticLine2": "Second line: completing the poetic thought, influencer style (100 characters max)",
    "bartenderLine": "Third line: 1920s Chicago bartender, playful and teasing, recommends trying something new if classic, or going back to the regular cocktail if elevated. Make this line different every time, with unique slang and playful tone. (100 characters max)"
}

Requirements:
- Write like a food influencer posting on Twitter
- Use poetic idioms and metaphors about the cocktail
- Reference ${currentSeason} season naturally
- Both poetic lines should work for any version of this cocktail
- The bartender line must be playful, in a 1920s Chicago accent, and always different (use random slang/phrasing)
- If the cocktail is classic, bartender teases to try the elevated/new version
- If the cocktail is elevated, bartender teases to try the regular/classic version
- Keep each line under 100 characters
- Valid JSON only
- Do not repeat bartender lines for the same cocktail in the same session
`;

    const requestBody = {
        contents: [{
            parts: [{
                text: promptText
            }]
        }],
        generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 200,
            candidateCount: 1
        }
    };

    try {
        const geminiResponse = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            requestBody,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 15000
            }
        );

        if (!geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response structure from Gemini API');
        }

        const responseText = geminiResponse.data.candidates[0].content.parts[0].text;
        const parsed = extractAndParseJSON(responseText);
        
        if (parsed && parsed[0]) {
            const result = parsed[0];
            return {
                text: `${result.poeticLine1}\n${result.poeticLine2}`,
                showUpgradeButton: true
            };
        }
        
        throw new Error('Could not parse comment response');
        
    } catch (error) {
        console.error('Gemini comment generation error:', error.message);
        
        // Fallback poetic comment - same for all versions
        const fallbackPoetic = [
            `${currentSeason}'s liquid poetry, pure delight,`,
            `Each sip a verse that feels just right.`
        ];
        
        return {
            text: fallbackPoetic.join('\n'),
            showUpgradeButton: true
        };
    }
}

// Export functions
module.exports = {
    fetchAndProcessGeminiResults,
    generateCocktailComment,
    getCurrentTheme // Export for use in other modules if needed
};