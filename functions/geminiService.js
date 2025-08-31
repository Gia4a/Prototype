// functions/geminiService.js
const axios = require('axios');
const { isFoodItem, isLiquorType, isFlavoredLiquor, isShooterQuery, FLAVORED_LIQUORS, LIQUOR_TYPES } = require('./constants');

// Constants
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';


// --- ADDED: Season helpers ---
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

function getSeasonalIngredients(season) {
    switch (season) {
        case 'spring':
            return 'fresh berries, rhubarb, mint, light florals';
        case 'summer':
            return 'watermelon, peaches, basil, tropical fruits';
        case 'fall':
            return 'apples, cranberries, pumpkin spice, cinnamon';
        case 'winter':
            return 'citrus (blood orange, grapefruit), warming spices, pine';
        default:
            return 'seasonal fruits and spices';
    }
}

// Enhanced seasonal ingredients
const SEASONAL_FRUIT_JUICES = {
    spring: ['strawberry juice', 'rhubarb juice', 'elderflower cordial', 'fresh lemon juice with mint'],
    summer: ['watermelon juice', 'peach nectar', 'fresh berry juice', 'pineapple juice', 'mango juice'],
    fall: ['apple cider', 'cranberry juice', 'pomegranate juice', 'pear juice'],
    winter: ['blood orange juice', 'grapefruit juice', 'pomegranate juice', 'spiced apple cider']
};

// Random premium spirit selections
const PREMIUM_SPIRITS = {
    vodka: ['Grey Goose', 'Belvedere', 'Titos', 'Ketel One'],
    rum: ['Mount Gay', 'Plantation', 'Diplomatico', 'Ron Zacapa'],
    gin: ['Hendricks', 'Bombay Sapphire', 'Tanqueray', 'Aviation'],
    whiskey: ['Woodford Reserve', 'Buffalo Trace', 'Bulleit', 'Makers Mark'],
    tequila: ['Espolon', 'Herradura', 'Casamigos', 'Don Julio']
};

// Specialty liqueurs for randomness
const SPECIALTY_LIQUEURS = [
    'elderflower liqueur', 'amaretto', 'triple sec', 'peach schnapps', 
    'coconut rum', 'vanilla vodka', 'cinnamon whiskey', 'honey bourbon'
];

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
    'aviation': ['maraschino liqueur', 'crème de violette'],
    'last word': ['green chartreuse', 'maraschino liqueur']
};

// Helper function to get random seasonal fruit juice
function getRandomSeasonalJuice(season) {
    const seasonalJuices = SEASONAL_FRUIT_JUICES[season] || SEASONAL_FRUIT_JUICES.summer;
    return seasonalJuices[Math.floor(Math.random() * seasonalJuices.length)];
}

// Helper function to get random flavored spirit
function getRandomFlavoredSpirit() {
    return FLAVORED_LIQUORS[Math.floor(Math.random() * FLAVORED_LIQUORS.length)];
}

// Helper function to get random premium spirit
function getRandomPremiumSpirit(baseSpirit) {
    const premiumOptions = PREMIUM_SPIRITS[baseSpirit.toLowerCase()];
    if (premiumOptions) {
        return premiumOptions[Math.floor(Math.random() * premiumOptions.length)];
    }
    return baseSpirit;
}

// Helper function to get random specialty liqueur
function getRandomSpecialtyLiqueur() {
    return SPECIALTY_LIQUEURS[Math.floor(Math.random() * SPECIALTY_LIQUEURS.length)];
}

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

// Get a random cocktail name for a spirit (not restricted to classics)
function getRandomCocktailForSpirit(spirit) {
    const cocktailNames = [
        'Twilight', 'Sunset', 'Garden', 'Storm', 'Breeze', 'Fizz', 'Splash', 'Mist',
        'Cooler', 'Spritz', 'Punch', 'Smash', 'Sour', 'Collins', 'Mule', 'Rickey'
    ];
    const randomName = cocktailNames[Math.floor(Math.random() * cocktailNames.length)];
    return `${spirit.charAt(0).toUpperCase() + spirit.slice(1)} ${randomName}`;
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

// Enhanced prompts with specific recipes to avoid repetition
const getClassicCocktailPrompt = (query) => {
    const randomSeed = Math.floor(Math.random() * 1000);
    const specialtyItems = SPECIALTY_CLASSIC_INGREDIENTS[query.toLowerCase()] || [];
    const allowedSpecialty = specialtyItems.length > 0 ? `You may use these specialty items for authenticity: ${specialtyItems.join(', ')}` : '';
    
        return `
Return a JSON array with exactly 2 cocktail recipes for the classic "${query}":

INGREDIENT RESTRICTIONS (CRITICAL):
- Maximum 3 total between spirits and liqueurs combined
- Use 1-2 spirits, 0-2 liqueurs
- For mixers/garnishes: ONLY common kitchen ingredients: ${KITCHEN_MIXERS.join(', ')}
- ${allowedSpecialty}
- Always include "oz" in measurements like "2 oz", "1 oz", "0.5 oz"

Format:
[
    {
        "title": "Classic ${query}",
        "snippet": "Ingredients: [authentic classic recipe with exact measurements including 'oz', and seasonal fruit can be included in basic recipe]. Instructions: [traditional method]",
        "filePath": null,
        "why": "authentic classic recipe",
        "hasUpgrade": true
    },
    {
        "title": "Seasonal ${query}",
        "snippet": "Ingredients: [classic recipe with seasonal fruit juice addition]. Instructions: [enhanced method]",
        "filePath": null,
        "why": "seasonal interpretation",
        "hasUpgrade": false
    }
]

CRITICAL: Use the AUTHENTIC classic ${query} recipe with proper measurements including "oz". Seasonal fruit can be included in basic recipe. Add seasonal fruit juice to second recipe.
Seed: ${randomSeed}
`;
};

const getShooterPrompt = (query) => {
    const randomSeed = Math.floor(Math.random() * 1000);
    const randomFlavoredSpirit = getRandomFlavoredSpirit();
    
    return `
Create a shooter recipe for "${query}" using interesting flavored spirits and liqueurs.

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
Recommend a specific cocktail pairing for "${query}" using seasonal ingredients.

Return JSON array:
[{"title": "Perfect Pairing for ${query}", "snippet": "Cocktail: [specific cocktail name]. Ingredients: [detailed list with measurements including 'oz' like '2 oz vodka', '1 oz lime juice', '0.5 oz ${seasonalJuice}']. Instructions: [complete preparation method]. Pairing Notes: [why this works with ${query}]", "filePath": "willowpark.net", "why": "expert food pairing", "hasUpgrade": true}]

Requirements:
- Name a specific cocktail that pairs well
- Include ALL ingredient measurements with "oz" (2 oz, 1 oz, 0.5 oz, dash, etc.)
- Include seasonal fruit juice: ${seasonalJuice}
- Complete preparation instructions
- Explain the flavor pairing logic
- Use accessible ingredients only
- Unique suggestion (seed: ${randomSeed})
- Valid JSON structure`;
};

const getLiquorPrompt = (query) => {
    const randomSeed = Math.floor(Math.random() * 1000);
    const randomCocktailName = getRandomCocktailForSpirit(query);
    const currentSeason = getCurrentSeason();
    const seasonalJuice = getRandomSeasonalJuice(currentSeason);
    const specialtyLiqueur = getRandomSpecialtyLiqueur();
    const premiumSpirit = getRandomPremiumSpirit(query);
    
    return `
Return a JSON array with exactly 2 random cocktail recipes featuring "${query}" as the main spirit:

INGREDIENT RESTRICTIONS (CRITICAL):
- Maximum 3 total between spirits and liqueurs combined
- Use 1-2 spirits (${query} must be primary)
- Use 0-2 liqueurs maximum
- Include seasonal fruit juice: ${seasonalJuice}
- Consider premium spirits like: ${premiumSpirit}
- Consider specialty liqueurs like: ${specialtyLiqueur}
- Always include "oz" in measurements

Format:
[
  {
    "title": "${randomCocktailName}",
    "snippet": "Ingredients: [2 oz ${premiumSpirit}, seasonal juice, specialty liqueur, with exact measurements including 'oz']. Instructions: [complete method]",
    "filePath": null,
    "why": "creative ${query} cocktail",
    "hasUpgrade": true
  },
  {
    "title": "Seasonal ${query} Refresher",
    "snippet": "Ingredients: [2 oz ${query}, ${seasonalJuice}, simple mixers with measurements including 'oz']. Instructions: [refreshing method]",
    "filePath": null,
    "why": "seasonal ${query} creation",
    "hasUpgrade": false
  }
]

EXAMPLES of valid seasonal combinations:
- 2 oz ${premiumSpirit} + 1 oz ${specialtyLiqueur} + 1 oz ${seasonalJuice} + 0.5 oz lime juice
- 2 oz ${query} + 0.5 oz elderflower liqueur + 1 oz ${seasonalJuice} + club soda

CRITICAL: Include "oz" in ALL measurements. Add seasonal fruit juice. Use premium/flavored spirits for variety.
Seed: ${randomSeed}
`;
};

const getCocktailPrompt = (query) => {
    const randomSeed = Math.floor(Math.random() * 1000);
    const currentSeason = getCurrentSeason();
    const seasonalJuice = getRandomSeasonalJuice(currentSeason);
    const randomFlavored = getRandomFlavoredSpirit();
    const randomSpecialty = getRandomSpecialtyLiqueur();
    
    return `
Return a JSON array with exactly 2 random cocktail recipes inspired by "${query}":

INGREDIENT RESTRICTIONS (CRITICAL):
- Maximum 3 total between spirits and liqueurs combined
- Use 1-2 spirits (can mix premium brands, flavored spirits)
- Use 0-2 liqueurs maximum
- Include seasonal fruit juice: ${seasonalJuice}
- Consider flavored spirits: ${randomFlavored}
- Consider specialty liqueurs: ${randomSpecialty}
- Always include "oz" in measurements

Format:
[
  {
    "title": "Seasonal ${query} Creation",
    "snippet": "Ingredients: [follow restrictions with exact measurements including 'oz' like '2 oz gin', '1 oz ${randomSpecialty}', '1 oz ${seasonalJuice}']. Instructions: [complete step-by-step method]",
    "filePath": null,
    "why": "creative seasonal ${query} interpretation",
    "hasUpgrade": true
  },
  {
    "title": "Premium ${query} Experience",
    "snippet": "Ingredients: [upgraded version with premium spirits and seasonal juice, measurements with 'oz']. Instructions: [enhanced preparation method]",
    "filePath": null,
    "why": "premium ${query} creation",
    "hasUpgrade": false
  }
]

EXAMPLES of valid seasonal combinations:
- 2 oz premium gin + 1 oz elderflower liqueur + 1 oz ${seasonalJuice} + lime juice
- 1.5 oz ${randomFlavored} + 0.5 oz ${randomSpecialty} + 1 oz ${seasonalJuice} + club soda

CRITICAL: Create unique seasonal recipes with premium ingredients. Include "oz" in ALL measurements. Add seasonal fruit juice.
Seed: ${randomSeed}
`;
};

// Enhanced fallback with proper measurements and seasonal elements
function createFallbackResponse(query, category = 'general') {
    const currentSeason = getCurrentSeason();
    const seasonalJuice = getRandomSeasonalJuice(currentSeason);
    const randomPremium = getRandomPremiumSpirit('vodka');
    
    const randomVariations = {
        food: [
            `Wine & Cocktail Pairing for ${query}`,
            `Perfect Drink Match for ${query}`, 
            `Beverage Harmony with ${query}`
        ],
        liquor: [
            `Classic ${query} Cocktail`,
            `Traditional ${query} Recipe`,
            `Premium ${query} Creation`
        ],
        general: [
            `${query} Inspired Cocktail`,
            `Craft ${query} Creation`,
            `Mixologist's ${query} Special`
        ]
    };
    
    const titles = randomVariations[category] || randomVariations.general;
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    
    const fallbackData = {
        food: [{
            title: randomTitle,
            snippet: `Cocktail: Seasonal Spritz. Ingredients: 2 oz white wine, 1 oz elderflower liqueur, 1 oz ${seasonalJuice}, 0.5 oz lime juice, 2 oz club soda, lime wheel garnish. Instructions: Build over ice in wine glass, stir gently, garnish with lime. Pairing Notes: The crisp acidity and seasonal fruit complement ${query} beautifully.`,
            filePath: "willowpark.net",
            why: "Professional pairing recommendation based on flavor harmony.",
            hasUpgrade: true
        }],
        liquor: [{
            title: randomTitle,
            snippet: `Ingredients: 2 oz ${query}, 1 oz ${seasonalJuice}, 0.75 oz fresh lemon juice, 0.5 oz simple syrup, lemon twist garnish. Instructions: Combine all ingredients except garnish in shaker with ice, shake vigorously for 10 seconds, strain into chilled coupe glass, express lemon twist over drink and drop in.`,
            filePath: null,
            why: "Seasonal preparation showcasing the spirit's character.",
            hasUpgrade: true
        }],
        general: [{
            title: randomTitle,
            snippet: `Ingredients: 2 oz ${randomPremium}, 1 oz elderflower liqueur, 1 oz ${seasonalJuice}, 0.75 oz fresh lime juice, 0.25 oz simple syrup, 3 oz tonic water, cucumber wheel garnish. Instructions: Muddle cucumber in shaker, add spirits and juices, shake with ice, strain over fresh ice in highball glass, top with tonic, garnish with cucumber wheel.`,
            filePath: null,
            why: "Expert mixologist creation with seasonal flavors.",
            hasUpgrade: true
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
            temperature: 0.8,        // Higher for more variety
            topK: 50,               // More creative options
            topP: 0.9,              // Better creativity balance
            maxOutputTokens: 1024,   // More space for detailed recipes
            candidateCount: 1        // Single response for consistency
        }
    };

    try {
        console.log("Sending request to Gemini API with enhanced seasonal settings...");
        
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
            snippet: item.snippet || 'No details available.',
            hasUpgrade: item.hasUpgrade || false
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

// Enhanced cocktail comment generation
async function generateCocktailComment(cocktailName, ingredients, season, apiKey, hasUpgrade = false) {
    if (!apiKey) {
        throw new Error('API key for Gemini service is not configured.');
    }

    const currentDate = new Date();
    const currentSeason = season || getCurrentSeason();
    
    const promptText = `
Create a poetic cocktail description for "${cocktailName}" with these ingredients: ${ingredients.join(', ')}.

Format as JSON:
{
    "poeticLine1": "First poetic line about the cocktail (under 50 characters)",
    "poeticLine2": "Second poetic line completing the thought (under 50 characters)",
    "poeticLine3": "A single sentence, in the style of a 1920s bartender, describing this as a premium, adventurous drink (under 80 characters)",
    "showUpgradeButton": ${hasUpgrade}
}

Requirements:
- Three lines that flow poetically together
- Reference the ${currentSeason} season and ingredients
- poeticLine3 must be a single sentence, 1920s bartender style, describing a premium/adventurous drink (max 80 characters)
- Keep poeticLine1 and poeticLine2 under 50 characters for better display
- Valid JSON structure only
- Focus on the drink's appeal and seasonal connection
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
            maxOutputTokens: 256,
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
            // Return structured comment data
            return {
                text: `${result.poeticLine1}\n${result.poeticLine2}\n${result.poeticLine3}`,
                showUpgradeButton: result.showUpgradeButton || hasUpgrade
            };
        }
        
        throw new Error('Could not parse comment response');
        
    } catch (error) {
        console.error('Gemini comment generation error:', error.message);
        
        // Enhanced fallback poetic comment
        const fallbackPoetic = [
            `${currentSeason}'s perfect blend, smooth and bright,`,
            `A cocktail crafted for pure delight,`,
            `Sip and savor summer's finest bite.`
        ];
        
        return {
            text: fallbackPoetic.join('\n'),
            showUpgradeButton: hasUpgrade
        };
    }
}

// Enhanced seasonal upgrade recipe
async function generateSeasonalUpgrade(originalCocktail, upgradeType, season, apiKey) {

    if (!apiKey) {
        throw new Error('API key for Gemini service is not configured.');
    }

    const currentSeason = season || getCurrentSeason();
    const seasonalJuice = getRandomSeasonalJuice(currentSeason);
    const premiumSpirit = getRandomPremiumSpirit('vodka');
    const specialtyLiqueur = getRandomSpecialtyLiqueur();

    const upgradePrompts = {
        seasonal: `Create a ${currentSeason} seasonal upgrade of "${originalCocktail}" using seasonal fruit juice: ${seasonalJuice}`,
        spicy: `Create a spicy/bold upgrade of "${originalCocktail}" using flavored spirits and bold ingredients`,
        premium: `Create a premium upgrade of "${originalCocktail}" using top-shelf spirits: ${premiumSpirit} and specialty liqueurs: ${specialtyLiqueur}`,
        festive: `Create a festive/holiday upgrade of "${originalCocktail}" with seasonal themes and special ingredients`
    };

    const promptText = `
${upgradePrompts[upgradeType] || upgradePrompts.seasonal}

Return JSON array:
[{"title": "Upgraded ${originalCocktail}", "snippet": "Ingredients: [detailed list with exact measurements including 'oz' like '2 oz ${premiumSpirit}', '1 oz ${specialtyLiqueur}', '1 oz ${seasonalJuice}']. Instructions: [complete preparation method with any special techniques]", "filePath": null, "why": "explanation of what makes this an upgrade", "hasUpgrade": false}]

Requirements:
- Include EXACT measurements with "oz" for all ingredients (2 oz, 1 oz, 0.5 oz, dash, etc.)
- Use seasonal elements for ${currentSeason}: ${getSeasonalIngredients(currentSeason)}
- Include seasonal fruit juice: ${seasonalJuice}
- Use premium spirits and specialty liqueurs for upgrades
- Explain what makes this an upgrade from the original
- Include complete step-by-step instructions
- Valid JSON structure only
`;

    // --- API call and response parsing logic ---
    const requestBody = {
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
    };
    try {
        const geminiResponse = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            requestBody,
            { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
        );
        const responseText = geminiResponse.data.candidates[0].content.parts[0].text;
        return extractAndParseJSON(responseText);
    } catch (error) {
        console.error('Gemini upgrade generation error:', error.message);
        return createFallbackResponse(originalCocktail, 'general');
    }
}

// Export the main functions for use in other modules
module.exports = {
    fetchAndProcessGeminiResults,
    generateCocktailComment,
    generateSeasonalUpgrade,
    // ... any other functions you want to export from this file
};