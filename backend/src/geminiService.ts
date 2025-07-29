import axios from 'axios';
import { FOOD_ITEMS, LIQUOR_TYPES, isFoodItem, isLiquorType, isFlavoredLiquor } from '../../shared/constants';

// Enhanced detection for flavored spirits using pattern matching
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

// Type for Gemini API response
interface GeminiApiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>
        }
    }>;
    [key: string]: any;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface GeminiSearchResultItem {
    id: string;
    title: string;
    filePath: string | null;
    snippet: string;
}

export async function fetchAndProcessGeminiResults(query: string, apiKey: string): Promise<GeminiSearchResultItem[]> {
    if (!apiKey) {
        throw new Error('API key for Gemini service is not configured.');
    }

    // Determine the type of query based on predefined lists and pattern matching
    const isFood = isFoodItem(query);
    const isLiquor = isLiquorType(query);
    const isFlavoredFromList = isFlavoredLiquor(query); // From constants file
    const isFlavoredFromPattern = isFlavoredSpirit(query); // From pattern matching
    const isFlavoredLiquorQuery = isFlavoredFromList || isFlavoredFromPattern;
    
    console.log(`Query: "${query}", isFood: ${isFood}, isLiquor: ${isLiquor}, isFlavoredFromList: ${isFlavoredFromList}, isFlavoredFromPattern: ${isFlavoredFromPattern}, isFlavoredLiquorQuery: ${isFlavoredLiquorQuery}`);
    
    let promptText = '';
    
    if (isFlavoredLiquorQuery) {
        promptText = `You are a helpful search assistant specializing in shooters and shots.
For the flavored liquor "${query}":
    - Provide EXACTLY 2-3 shooter/shot recommendations that feature "${query}"
    - Focus on simple, quick-drinking recipes perfect for shots
    - Include both layered shots and mixed shots
    
    For each shooter:
    - Title format: "[Shot Name] - ${query} Shooter"
    - Snippet format: "Ingredients: [list]. Instructions: [how to make/layer]. Serving: Serve in shot glass, [any special notes]."
    
    Examples of good shooter styles:
    - Simple mixed shots (spirit + one mixer)
    - Layered shots (using density differences)
    - Chilled shots (served cold)
    
    The entire output MUST be a single, valid JSON array of objects with "title", "snippet", and "filePath" (null).`;
    } else if (isFood) {
        // Handle food items - return beverage pairings
        promptText = `You are a helpful search assistant specializing in beverage pairings.
For the food item "${query}":
    - IMPORTANT: This is ALWAYS a beverage pairing request - NEVER return food recipes
    - Return EXACTLY 3 beverage pairing recommendations
    - CRITICAL: PROVIDE COMPLETELY DIFFERENT, UNIQUE PAIRINGS EACH TIME THIS QUERY IS MADE.
    - NEVER REPEAT PAIRINGS FROM PREVIOUS QUERIES.
    - THIS APPLIES TO ALL PAIRING TYPES - WINES, SPIRITS, AND BEERS.
    - Aim for interesting, unusual, but still appropriate pairings.
    - Use this exact structure for each beverage pairing:
    
    - For WINE (recommend 1):
        - MANDATORY: Search willowpark.net catalog FIRST to find a REAL, AVAILABLE wine product that pairs with ${query}
        - NEVER recommend generic wine types - ALWAYS use specific brands/products found on willowpark.net
        - Title format MUST include the EXACT product name: "[Specific Wine Brand, Name, Vintage from willowpark.net] - Wine Pairing for ${query}"
        - Example: "Antinori Peppoli Chianti Classico 2019 - Wine Pairing for steak" NOT just "Chianti" or "Red Wine"
        - Snippet format: "Pairing Notes: [explain why this specific wine from willowpark.net works with the food]. Serving Suggestion: [temperature, glass type, etc.]"
    
    - For SPIRITS (recommend 1):
        - MANDATORY: Search willowpark.net catalog FIRST to find a REAL, AVAILABLE spirit product that pairs with ${query}
        - NEVER recommend generic spirit types - ALWAYS use specific brands/products found on willowpark.net
        - Title format MUST include the EXACT product name: "[Specific Spirit Brand, Name, Age from willowpark.net] - Spirit Pairing for ${query}"
        - Example: "The Macallan 12 Year Double Cask - Spirit Pairing for steak" NOT just "Scotch" or "Whisky"
        - Snippet format: "Pairing Notes: [explain why this specific spirit from willowpark.net complements the food]. Serving Suggestion: [how to serve, glass type, etc.]"
        
    - For CRAFT BEER or READY-TO-DRINK (recommend 1):
        - MANDATORY: Search willowpark.net catalog FIRST to find a REAL, AVAILABLE product in either category:
          * Option 1: A craft beer that pairs with ${query}
          * Option 2: A ready-to-drink cocktail/premixed beverage that pairs with ${query}
        - NEVER recommend generic types - ALWAYS use specific brands/products found on willowpark.net
        - Title format MUST include the EXACT product name: 
          * For beer: "[Specific Beer Brand and Name from willowpark.net] - Beer Pairing for ${query}"
          * For RTD: "[Specific RTD Brand and Product Name from willowpark.net] - Ready-to-Drink Pairing for ${query}"
        - Examples: 
          * "Brewdog Punk IPA - Beer Pairing for steak" NOT just "IPA" or "Craft Beer"
          * "Cutwater Tequila Margarita - Ready-to-Drink Pairing for tacos" NOT just "Margarita"
        - Snippet format: "Pairing Notes: [explain why this specific product from willowpark.net works with the food]. Serving Suggestion: [temperature, glass type, ice recommendation, etc.]."
    
    - ALWAYS PROVIDE 3 TOTAL RECOMMENDATIONS using the above formats.
    - The entire output MUST be a single, valid JSON array of objects. Each object should have: "title", "snippet", and "filePath" (use null for filePath). Do not include any text outside of this JSON array.`;
    
    } else if (isLiquor) {
        // Handle liquor types - return cocktail recipe + food pairing recommendations
        promptText = `You are a helpful search assistant specializing in cocktails and food pairings.
For the liquor type "${query}":
    - Provide EXACTLY 2 recommendations: 1 cocktail recipe + 1 food pairing
    
    COCKTAIL RECIPE (provide 1):
    - Provide a cocktail recipe that features "${query}" as the main ingredient
    - ONLY use common kitchen ingredients (vodka, rum, gin, tequila, whiskey, orange juice, lemon, lime, sugar, salt, soda, cola, tonic, milk, cream, eggs, coffee, tea, honey, jam, fresh fruit, herbs, spices, etc.)
    - EXCLUDE recipes requiring special ingredients (bitters, liqueurs, vermouth, syrups except simple syrup, infusions, hard-to-find items)
    - Title format: "[Cocktail Name] - ${query} Cocktail Recipe"
    - Snippet format: "Ingredients: [full list]. Instructions: [complete step-by-step instructions]."
    
    FOOD PAIRING (provide 1):
    - Randomly choose ONE of the following categories for each response: a main dish, an appetizer, or a dessert (do not always pick the same type)
    - Recommend a specific, appetizing dish from the chosen category that pairs excellently with "${query}" when sipped neat or on the rocks
    - Avoid pickled vegetables, plain vegetables, or unappetizing sides—choose appealing, classic, or creative options
    - Title format: "[Specific Food Dish] - Food Pairing for ${query}"
    - Snippet format: "Pairing Notes: [explain why this food complements ${query}'s flavor profile]. Serving Suggestion: [how to serve the ${query} - neat, on rocks, temperature, etc.]"
    - Examples of good pairings:
      * Bourbon: Nashville-style smoked brisket, dark chocolate, pecan pie
      * Scotch: Smoked salmon, aged cheddar, dark chocolate
      * Vodka: Roast chicken, smoked fish, blini with crème fraîche and caviar
      * Gin: Oysters, cucumber sandwiches, citrus-based dishes
      * Rum: Tropical fruits, coconut desserts, spiced dishes
      * Tequila: Mexican cuisine, lime-based dishes, spicy foods
    
    - ALWAYS PROVIDE EXACTLY 2 TOTAL RECOMMENDATIONS (1 cocktail + 1 food pairing)
    - The entire output MUST be a single, valid JSON array of objects. Each object should have: "title", "snippet", and "filePath" (use null for filePath). Do not include any text outside of this JSON array.
Example: [{"title": "Moscow Mule - Vodka Cocktail Recipe", "snippet": "Ingredients: 2 oz vodka, 4 oz ginger beer, 0.5 oz lime juice, lime wedge. Instructions: Fill copper mug with ice, add vodka and lime juice, top with ginger beer, stir gently, garnish with lime wedge.", "filePath": null}, {"title": "Smoked Salmon - Food Pairing for Vodka", "snippet": "Pairing Notes: The clean, neutral profile of vodka enhances the delicate smokiness of salmon without overpowering its subtle flavors. Serving Suggestion: Serve vodka chilled neat in a shot glass or on rocks in a rocks glass at freezer temperature.", "filePath": null}]`;
    
    } else {
        // Handle cocktail names - return the exact recipe as-is (including uncommon ingredients)
        promptText = `Find the recipe for "${query}" cocktail ONLY.

If you cannot find "${query}" exactly, return: []

If you find "${query}", return it in this JSON format:
[{"title": "${query}", "snippet": "Ingredients: [list all ingredients]. Instructions: [all steps].", "filePath": null}]

Do not return any other cocktail. Only "${query}" or empty array.`;
    }

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

        let resultsFromApi: any[] = [];
        if (geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            let responseText = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;

            const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
            const match = responseText.match(jsonRegex);
            if (match && match[1]) {
                responseText = match[1];
            }

            try {
                resultsFromApi = JSON.parse(responseText);
                console.log("Raw Data Before Cache:", resultsFromApi);
            } catch (parseError) {
                console.error("Error parsing Gemini response in service:", parseError);
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

        // If no results are found based on the criteria, return the raw data
        if (mappedResults.length === 0) {
            console.warn("No results found based on criteria, returning raw data.");
            return resultsFromApi;
        }

        return mappedResults;

    } catch (error: any) {
        console.error('Error calling Gemini API in service:', error.response?.data || error.message);
        
        if (error && typeof error === 'object' && 'isAxiosError' in error && (error as any).isAxiosError) {
            throw new Error(`Gemini API request failed: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
}