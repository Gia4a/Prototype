import axios from 'axios';
import { isFoodItem, isLiquorType, isFlavoredLiquor, isShooterQuery } from '../../shared/constants';

// Constants
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Types
interface GeminiApiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>
        }
    }>;
    [key: string]: any;
}

export interface GeminiSearchResultItem {
    id: string;
    title: string;
    filePath: string | null;
    snippet: string;
}

// Helper Functions
function isFlavoredSpirit(query: string): boolean {
    const flavoredPatterns = [
        // Brand + flavor combinations
        /\b(crown|smirnoff|absolut|grey goose|captain morgan|jose cuervo|jack daniels|jim beam|jameson|bacardi|malibu)\s+(peach|apple|vanilla|cherry|cinnamon|coconut|lime|citrus|raspberry|strawberry|blueberry|watermelon|pineapple|mango|honey|caramel|banana|orange)/i,
        
        // Specific well-known flavored spirits
        /\b(fireball|goldschlager|sambuca|hypnotiq|hpnotiq)\b/i,
        
        // Flavor + base spirit combinations
        /\b(peach|apple|vanilla|cherry|cinnamon|coconut|raspberry|strawberry|blueberry|watermelon|pineapple|mango|honey|caramel|banana|orange)\s+(vodka|whiskey|whisky|rum|tequila|gin|schnapps)/i,
        
        // Cream liqueurs
        /\b(baileys|kahlua|amaretto|frangelico|sambuca)\b/i,
        
        // Flavored rums
        /\b(captain morgan|bacardi|malibu)\s+(spiced|coconut|vanilla|cherry|pineapple)/i,
        
        // Flavored vodkas
        /\b(absolut|smirnoff|grey goose|titos|pinnacle)\s+(citron|vanilla|cherry|raspberry|peach|apple|coconut)/i
    ];
    
    return flavoredPatterns.some(pattern => pattern.test(query));
}

// Enhanced JSON parsing function
function extractAndParseJSON(responseText: string): any[] {
    // Remove any markdown code blocks
    let cleanText = responseText.replace(/```json\s*([\s\S]*?)\s*```/g, '$1');
    cleanText = cleanText.replace(/```\s*([\s\S]*?)\s*```/g, '$1');
    
    // Try to find JSON array in the text
    const jsonArrayRegex = /\[\s*\{[\s\S]*?\}\s*\]/;
    const match = cleanText.match(jsonArrayRegex);
    
    if (match) {
        cleanText = match[0];
    }
    
    // Clean up common issues
    cleanText = cleanText.trim();
    cleanText = cleanText.replace(/,\s*\]/g, ']'); // Remove trailing commas
    cleanText = cleanText.replace(/,\s*\}/g, '}'); // Remove trailing commas in objects
    
    return JSON.parse(cleanText);
}

// Response validation function
function validateGeminiResponse(results: any[]): boolean {
    if (!Array.isArray(results) || results.length !== 2) {
        return false;
    }
    
    return results.every(item => 
        item.hasOwnProperty('title') &&
        item.hasOwnProperty('snippet') &&
        item.hasOwnProperty('filePath') &&
        typeof item.title === 'string' &&
        typeof item.snippet === 'string' &&
        item.title.length > 0 &&
        item.snippet.length > 0
    );
}

// Enhanced Prompt Templates
const getShooterPrompt = (query: string): string => `You are a professional bartender and mixologist specializing in creative shooters and shots.

For the ${query.includes('shooter') || query.includes('shot') ? 'shooter request' : 'flavored liquor'} "${query}":

**CRITICAL: Your response must be ONLY a valid JSON array with this exact structure:**
[
  {
    "title": "Shot Name - ${query} Shooter",
    "snippet": "Ingredients: [list with measurements]. Instructions: [step-by-step]. Serving: [glass type and garnish]. [Flavor description].",
    "filePath": null
  },
  {
    "title": "Shot Name - ${query} Shooter",
    "snippet": "Ingredients: [list with measurements]. Instructions: [step-by-step]. Serving: [glass type and garnish]. [Flavor description].",
    "filePath": null
  }
]

**Do not include any text before or after the JSON array. No explanations, no markdown code blocks.**

**Example format:**
[
  {
    "title": "Fire Kiss - Fireball Shooter",
    "snippet": "Ingredients: 1 oz Fireball whiskey, 0.5 oz cranberry juice, splash of lime. Instructions: Shake with ice, strain into shot glass. Serving: Serve in chilled shot glass with lime wheel. Sweet cinnamon heat with tart cranberry balance.",
    "filePath": null
  }
]

FIRST SHOOTER (Simple): Create a simple shooter with "${query}" + 1-2 mixers only
SECOND SHOOTER (Complex): Use "${query}" + 1 additional basic spirit + mixers

Requirements:
- Additional spirits must be basic: vodka, rum, gin, tequila, whiskey, bourbon, or their flavored versions
- NO exotic liqueurs or special ingredients
- Include specific measurements (oz, ml, dashes, etc.)
- Provide clear, step-by-step instructions
- Mention appropriate glassware and garnishes
- Keep snippets between 50-80 words
- Create unique, memorable shot names`;

const getFoodPairingPrompt = (query: string): string => `You are a food and beverage pairing expert with extensive knowledge of flavor profiles and complementary combinations.

For the food item "${query}", provide exactly 2 drink recommendations that create exceptional pairings.

**Response format (JSON array only):**
[
  {
    "title": "[Drink Name] - Perfect with ${query}",
    "snippet": "Why it pairs: [flavor explanation]. Drink details: [ingredients/style]. Serving suggestion: [how to serve and when].",
    "filePath": null
  },
  {
    "title": "[Drink Name] - Perfect with ${query}",
    "snippet": "Why it pairs: [flavor explanation]. Drink details: [ingredients/style]. Serving suggestion: [how to serve and when].",
    "filePath": null
  }
]

**Example format:**
[
  {
    "title": "Smoky Old Fashioned - Perfect with BBQ Ribs",
    "snippet": "Why it pairs: The smoky whiskey complements the char while sweet notes balance spicy rub. Drink details: Bourbon, maple syrup, orange bitters, smoked salt rim. Serving suggestion: Serve neat in rocks glass, best during the meal.",
    "filePath": null
  }
]

**Requirements:**
- One alcoholic and one non-alcoholic recommendation
- Explain WHY each pairing works (complementary/contrasting flavors, texture, temperature)
- Include specific drink ingredients or style
- Keep snippets between 50-80 words
- No exotic or hard-to-find ingredients
- Include serving temperature/glass/timing suggestions

**Response must be valid JSON only. No additional text.**`;

const getLiquorPrompt = (query: string): string => `You are a master mixologist with deep knowledge of classic and contemporary cocktails.

For the liquor "${query}", provide exactly 2 cocktail recommendations that showcase this spirit beautifully.

**Response format (JSON array only):**
[
  {
    "title": "[Cocktail Name] - ${query} Cocktail",
    "snippet": "Ingredients: [with measurements]. Instructions: [method]. Flavor profile: [taste description]. Serving: [glass and garnish].",
    "filePath": null
  },
  {
    "title": "[Cocktail Name] - ${query} Cocktail", 
    "snippet": "Ingredients: [with measurements]. Instructions: [method]. Flavor profile: [taste description]. Serving: [glass and garnish].",
    "filePath": null
  }
]

**Example format:**
[
  {
    "title": "Smoked Maple Bourbon Sour",
    "snippet": "Ingredients: 2 oz bourbon, 0.75 oz lemon juice, 0.5 oz maple syrup, 2 dashes Angostura bitters, egg white. Instructions: Dry shake, then shake with ice, double strain. Flavor profile: Rich vanilla and caramel with bright citrus and smooth foam. Serving: Coupe glass with lemon twist.",
    "filePath": null
  }
]

**Requirements:**
- Include one classic and one modern/creative cocktail
- Provide specific measurements (oz, ml, dashes, etc.)
- Mention key flavor profiles and tasting notes
- Include mixing method (shake, stir, build, muddle)
- Suggest appropriate glassware and garnishes
- Keep snippets between 50-80 words
- Use accessible ingredients (no rare or expensive items)

**Response must be valid JSON only. No additional text.**`;

const getCocktailPrompt = (query: string): string => `You are a creative cocktail consultant specializing in innovative drinks and classic variations.

For the cocktail-related query "${query}", provide exactly 2 cocktail recommendations that perfectly address this request.

**Response format (JSON array only):**
[
  {
    "title": "[Cocktail Name] - ${query} Inspired",
    "snippet": "Concept: [drink concept]. Ingredients: [with measurements]. Method: [preparation]. Story: [brief background or inspiration].",
    "filePath": null
  },
  {
    "title": "[Cocktail Name] - ${query} Inspired",
    "snippet": "Concept: [drink concept]. Ingredients: [with measurements]. Method: [preparation]. Story: [brief background or inspiration].",
    "filePath": null
  }
]

**Example format:**
[
  {
    "title": "Garden Party Gimlet - Spring Cocktail",
    "snippet": "Concept: Fresh spring flavors with botanical gin. Ingredients: 2 oz gin, 0.75 oz lime juice, 0.5 oz elderflower liqueur, cucumber, mint. Method: Muddle cucumber, shake with ice, double strain. Story: Inspired by English garden parties, this refreshing twist on the classic gimlet celebrates spring.",
    "filePath": null
  }
]

**Requirements:**
- Create cocktails that genuinely relate to the query theme
- Include interesting backstory or concept for each drink
- Provide specific measurements and clear methods
- Mix classic techniques with creative twists
- Keep snippets between 50-80 words
- Suggest drinks for different skill levels
- Use ingredients that are reasonably accessible

**Response must be valid JSON only. No additional text.**`;

// Main Function
export async function fetchAndProcessGeminiResults(query: string, apiKey: string): Promise<GeminiSearchResultItem[]> {
    if (!apiKey) {
        throw new Error('API key for Gemini service is not configured.');
    }

    // Query Detection - All constants together
    const isFood = isFoodItem(query);
    const isLiquor = isLiquorType(query);
    const isFlavoredFromList = isFlavoredLiquor(query);
    const isFlavoredFromPattern = isFlavoredSpirit(query);
    const isShooter = isShooterQuery(query);
    const isFlavoredLiquorQuery = isFlavoredFromList || isFlavoredFromPattern || isShooter;
    
    // Debug logging
    console.log(`Query: "${query}", isFood: ${isFood}, isLiquor: ${isLiquor}, isFlavoredFromList: ${isFlavoredFromList}, isFlavoredFromPattern: ${isFlavoredFromPattern}, isShooter: ${isShooter}, isFlavoredLiquorQuery: ${isFlavoredLiquorQuery}`);
    
    // Determine prompt based on query type
    let promptText = '';
    if (isFlavoredLiquorQuery) {
        promptText = getShooterPrompt(query);
    } else if (isFood) {
        promptText = getFoodPairingPrompt(query);
    } else if (isLiquor) {
        promptText = getLiquorPrompt(query);
    } else {
        promptText = getCocktailPrompt(query);
    }

    // API Request Configuration (keeping your original settings for randomness)
    const requestBody = {
        contents: [{
            parts: [{
                text: promptText
            }]
        }],
        generationConfig: {
            temperature: 1.0,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048
        }
    };

    try {
        // Make API Call
        const geminiResponse = await axios.post<GeminiApiResponse>(
            `${GEMINI_API_URL}?key=${apiKey}`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        console.log("Raw Gemini API Response:", geminiResponse.data);

        // Process Response
        let resultsFromApi: any[] = [];
        if (geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const responseText = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;

            // Use enhanced JSON parsing
            try {
                resultsFromApi = extractAndParseJSON(responseText);
                console.log("Parsed Data Before Validation:", resultsFromApi);

                // Validate the response
                if (!validateGeminiResponse(resultsFromApi)) {
                    console.warn("Response validation failed, attempting to use raw data");
                    // Fallback to original parsing if validation fails
                    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
                    const match = responseText.match(jsonRegex);
                    if (match && match[1]) {
                        resultsFromApi = JSON.parse(match[1]);
                    } else {
                        resultsFromApi = JSON.parse(responseText);
                    }
                }

            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Error parsing Gemini response in service:", error.message);
                } else {
                    console.error("Error parsing Gemini response in service:", String(error));
                }
                console.error("Original responseText that failed parsing in service:", responseText);
                throw new Error('Failed to parse Gemini API response JSON.');
            }
        } else {
            console.warn("No valid text part found in Gemini response.");
            throw new Error('No valid content returned from Gemini API.');
        }
        
        const mappedResults = resultsFromApi.map((item: any, index: number) => ({
            id: item.id || `gemini-result-${index}-${Date.now()}`,
            title: item.title || 'Untitled Result',
            filePath: item.filePath || item.file_path,
            snippet: item.snippet || 'No snippet available.'
        }));

        // Return Results
        if (mappedResults.length === 0) {
            console.warn("No results found based on criteria, returning raw data.");
            return resultsFromApi;
        }

        return mappedResults;

    } catch (error: unknown) {
        const isAxiosError = (err: any) => err?.isAxiosError === true;
        if (isAxiosError(error)) {
            const axiosError = error as any;
            const message = axiosError.response?.data?.error?.message || axiosError.message;
            console.error('Error calling Gemini API in service:', message);
            throw new Error(`Gemini API request failed: ${message}`);
        } else if (error instanceof Error) {
            console.error('An unexpected error occurred:', error.message);
            throw error;
        } else {
            console.error('An unknown error occurred:', error);
            throw new Error('An unknown error occurred during the API call.');
        }
    }
}