// shooters.js - Firebase Functions compatible (CommonJS)
const axios = require('axios');

// Constants matching your geminiService.js structure
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

// Enhanced flavored liquors list for image recognition
const FLAVORED_LIQUORS = [
    'vanilla vodka', 'strawberry vodka', 'coconut rum', 'spiced rum',
    'cinnamon whiskey', 'honey bourbon', 'peach schnapps', 'cherry vodka',
    'apple whiskey', 'banana liqueur', 'chocolate vodka', 'raspberry vodka',
    'mango rum', 'pineapple vodka', 'watermelon vodka', 'blue curacao',
    'amaretto', 'kahlua', 'baileys', 'sambuca', 'jagermeister',
    'fireball', 'rumchata', 'hypnotiq', 'x-rated', 'three olives'
];

// Shooter-specific ingredients for better recognition
const SHOOTER_INGREDIENTS = [
    'grenadine', 'lime juice', 'cranberry juice', 'pineapple juice',
    'simple syrup', 'triple sec', 'blue curacao', 'peach schnapps',
    'chambord', 'midori', 'southern comfort', 'amaretto'
];

// JSON extraction helper (matching your geminiService.js pattern)
function extractAndParseJSON(responseText) {
    console.log("Raw shooter response length:", responseText.length);
    
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
        console.error("Shooter JSON parsing failed:", error.message);
        return [];
    }
}

/**
 * Analyze image to detect liquor bottle using Gemini Vision API
 * @param imageData - Base64 encoded image data from camera
 * @param apiKey - Gemini API key
 * @returns Promise with detection results
 */
async function detectLiquorFromImage(imageData, apiKey) {
    if (!apiKey) {
        return { success: false, error: 'API key not provided' };
    }

    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const prompt = `
Analyze this image to identify any liquor bottles, wine bottles, or alcoholic beverages visible.

Focus on:
- Brand names on labels
- Type of alcohol (vodka, rum, whiskey, wine, etc.)
- Flavor variations (vanilla, coconut, spiced, etc.)
- Bottle shape and characteristics
- Any text visible on labels

Return JSON:
{
    "detected": true/false,
    "liquorType": "specific brand and type if detected",
    "category": "vodka/rum/whiskey/wine/liqueur/etc",
    "flavor": "flavor variation if any",
    "confidence": 0.0-1.0,
    "details": "what you see in the image"
}

If no alcohol is detected, return:
{
    "detected": false,
    "confidence": 0.0,
    "details": "description of what is visible instead"
}
`;

    const requestBody = {
        contents: [{
            parts: [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: "image/jpeg",
                        data: base64Data
                    }
                }
            ]
        }],
        generationConfig: {
            temperature: 0.3,
            topK: 32,
            topP: 0.8,
            maxOutputTokens: 512,
            candidateCount: 1
        }
    };

    try {
        console.log("Sending image to Gemini Vision API...");
        
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            requestBody,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );

        if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response structure from Gemini API');
        }

        const responseText = response.data.candidates[0].content.parts[0].text;
        console.log("Gemini vision response:", responseText);

        const parsed = extractAndParseJSON(responseText);
        
        if (parsed.length > 0 && parsed[0]) {
            const result = parsed[0];
            
            if (result.detected && result.liquorType) {
                return {
                    success: true,
                    detectedLiquor: result.liquorType,
                    confidence: result.confidence || 0.8
                };
            } else {
                return {
                    success: false,
                    error: result.details || 'No alcoholic beverage detected in image'
                };
            }
        }
        
        throw new Error('Could not parse vision response');
        
    } catch (error) {
        console.error('Gemini Vision API Error:', error.message);
        return {
            success: false,
            error: `Image recognition failed: ${error.message}`
        };
    }
}

/**
 * Generate both shooter and cocktail recipes from detected liquor
 * @param liquorName - Name of detected liquor
 * @param apiKey - Gemini API key
 * @returns Promise with both recipes
 */
async function getRecipesFromLiquor(liquorName, apiKey) {
    if (!apiKey) {
        console.error('Gemini API key not provided');
        return { shooter: null, cocktail: null };
    }

    const randomSeed = Math.floor(Math.random() * 1000);
    
    // Enhanced prompt to generate both recipes
    const promptText = `
Create both a shooter recipe and a full cocktail recipe using "${liquorName}" as the main ingredient.

Return JSON array with exactly 2 recipes:
[
    {
        "type": "shooter",
        "name": "[Creative shooter name]",
        "ingredients": ["0.5 oz ${liquorName}", "0.5 oz [complementary liqueur]", "[mixer - dash/splash amount]"],
        "instructions": "[method - shake/layer/build, serve immediately in shot glass]",
        "glassType": "shot glass",
        "garnish": "[optional garnish]"
    },
    {
        "type": "cocktail", 
        "name": "[Creative cocktail name]",
        "ingredients": ["2 oz ${liquorName}", "[1-2 additional mixers with measurements]"],
        "instructions": "[complete cocktail preparation method]",
        "glassType": "[appropriate cocktail glass]",
        "garnish": "[cocktail garnish]"
    }
]

Requirements for SHOOTER:
- Use flavored spirits and liqueurs: ${FLAVORED_LIQUORS.slice(0, 6).join(', ')}
- Exact measurements with "oz" (0.5 oz, 0.25 oz, dash, splash)
- Bold flavors, simple preparation
- Quick consumption format

Requirements for COCKTAIL:
- 2 oz ${liquorName} as base spirit
- 1-2 additional mixers (max 3 total ingredients between spirits/liqueurs)
- Kitchen-friendly mixers: lemon juice, lime juice, simple syrup, club soda, tonic water
- Full cocktail experience, proper glass
- Complete preparation method

Both recipes should:
- Have creative names related to ${liquorName}
- Include appropriate garnishes
- Be unique variations (seed: ${randomSeed})
- Use exact measurements with "oz" notation
- Valid JSON only

Focus on complementary flavors that enhance ${liquorName}.
`;

    const requestBody = {
        contents: [{
            parts: [{
                text: promptText
            }]
        }],
        generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 768,
            candidateCount: 1
        }
    };

    try {
        console.log(`Generating both shooter and cocktail recipes for: ${liquorName}`);
        
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            requestBody,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );

        if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response structure from Gemini API');
        }

        const responseText = response.data.candidates[0].content.parts[0].text;
        const parsed = extractAndParseJSON(responseText);

        if (parsed.length >= 2) {
            const shooterData = parsed.find(r => r.type === 'shooter') || parsed[0];
            const cocktailData = parsed.find(r => r.type === 'cocktail') || parsed[1];
            
            return {
                shooter: {
                    name: shooterData.name || `${liquorName} Shooter`,
                    ingredients: shooterData.ingredients || [`0.5 oz ${liquorName}`, '0.5 oz triple sec'],
                    instructions: shooterData.instructions || 'Shake with ice, strain into shot glass, serve immediately.',
                    glassType: shooterData.glassType || 'shot glass',
                    garnish: shooterData.garnish
                },
                cocktail: {
                    name: cocktailData.name || `${liquorName} Cocktail`,
                    ingredients: cocktailData.ingredients || [`2 oz ${liquorName}`, '0.75 oz lime juice', '0.5 oz simple syrup'],
                    instructions: cocktailData.instructions || 'Shake with ice, strain into chilled glass, garnish and serve.',
                    glassType: cocktailData.glassType || 'rocks glass',
                    garnish: cocktailData.garnish
                }
            };
        }
        
        throw new Error('Could not parse both recipe responses');
        
    } catch (error) {
        console.error(`Error generating recipes for ${liquorName}:`, error.message);
        
        // Fallback recipes
        return {
            shooter: {
                name: `${liquorName} Shot`,
                ingredients: [`0.75 oz ${liquorName}`, '0.25 oz lime juice', 'pinch of salt'],
                instructions: 'Shake with ice, strain into shot glass, serve immediately.',
                glassType: 'shot glass'
            },
            cocktail: {
                name: `${liquorName} Sour`,
                ingredients: [`2 oz ${liquorName}`, '0.75 oz lemon juice', '0.5 oz simple syrup'],
                instructions: 'Shake with ice, strain into rocks glass over fresh ice, garnish with lemon wheel.',
                glassType: 'rocks glass',
                garnish: 'lemon wheel'
            }
        };
    }
}

/**
 * Complete image-to-recipes pipeline
 * @param imageData - Base64 encoded image from camera
 * @param apiKey - Gemini API key
 * @returns Promise with complete result including detection and both recipes
 */
async function getRecipesFromImage(imageData, apiKey) {
    try {
        // Step 1: Detect liquor in image
        console.log("Step 1: Detecting liquor from image...");
        const detection = await detectLiquorFromImage(imageData, apiKey);
        
        if (!detection.success || !detection.detectedLiquor) {
            return {
                success: false,
                error: detection.error || 'Could not detect any alcoholic beverage in the image'
            };
        }
        
        console.log(`Detected: ${detection.detectedLiquor}`);
        
        // Step 2: Generate both recipes
        console.log("Step 2: Generating shooter and cocktail recipes...");
        const recipes = await getRecipesFromLiquor(detection.detectedLiquor, apiKey);
        
        if (!recipes.shooter && !recipes.cocktail) {
            return {
                success: false,
                detectedLiquor: detection.detectedLiquor,
                error: 'Could not generate recipes'
            };
        }
        
        return {
            success: true,
            detectedLiquor: detection.detectedLiquor,
            shooter: recipes.shooter || undefined,
            cocktail: recipes.cocktail || undefined
        };
        
    } catch (error) {
        console.error('Complete recipe generation failed:', error.message);
        return {
            success: false,
            error: `Processing failed: ${error.message}`
        };
    }
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use getRecipesFromImage instead
 */
async function getShooterFromImage(imageData, apiKey) {
    const result = await getRecipesFromImage(imageData, apiKey);
    return {
        success: result.success,
        detectedLiquor: result.detectedLiquor,
        recipe: result.shooter || undefined,
        error: result.error
    };
}

// Export functions using CommonJS
module.exports = {
    detectLiquorFromImage,
    getRecipesFromLiquor,
    getRecipesFromImage,
    getShooterFromImage, // Legacy support
    FLAVORED_LIQUORS,
    SHOOTER_INGREDIENTS
};