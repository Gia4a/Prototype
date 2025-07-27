import axios from 'axios';


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

    const requestBody = {
        contents: [{
            parts: [{
                text: `You are a helpful search assistant specializing in cocktails and liquors.
For the user query "${query}":
    - Prioritize finding a recipe.
    - From available recipes, select 1 result that has the most complete and detailed 'ingredients' and 'instructions'.
    - For this top result, ensure its 'snippet' field includes the full ingredients and instructions directly. 
    - If 1 complete recipe is not found, return an empty array.
    - ONLY select recipes that use common kitchen ingredients (e.g., vodka, rum, gin, tequila, whiskey, orange juice, lemon, lime, sugar, salt, soda, cola, tonic, milk, cream, eggs, coffee, tea, honey, jam, fresh fruit, herbs, spices, etc.).
    - EXCLUDE any recipe that requires special or uncommon ingredients such as bitters, liqueurs, vermouth, syrups (except simple syrup), infusions, or hard-to-find items. Do NOT include any recipe that requires these.
- If "${query}" is a type of liquor (e.g., "Vodka", "Rum", "Gin", "Tequila", "Whiskey"):
    - CRITICALLY IMPORTANT: ALWAYS search willowpark.net catalog FIRST to find REAL, AVAILABLE products of this liquor type
    - NEVER recommend generic liquor types - ALWAYS use specific brands/products found on willowpark.net
    - Example: Use "Belvedere Vodka" or "Grey Goose Vodka" instead of just "Vodka"
    - For the selected liquor, the format MUST BE: "[Specific Brand/Product Name from willowpark.net]"
    - Provide a DIFFERENT specific product AND cocktail recipe each time this query is made
    - Select a random, less common, but still valid cocktail that features the specific liquor as a main ingredient.
    - For the cocktail recipe found (target 1):
        - The "title" MUST be the specific name of the cocktail recipe that uses the specific liquor brand.
        - The "snippet" MUST include the specific liquor brand from willowpark.net and contain the full list of ingredients and complete step-by-step instructions. Structure this clearly (e.g., "Ingredients: [list with the specific liquor brand]" then "Instructions: ...").
        - Prioritize a recipe with clear, comprehensive ingredients and instructions.
    - If a complete recipe is not found, return an empty array.
- If "${query}" is a food item (e.g., "steak", "pasta", "chocolate", "seafood", "taco", "burger", "pizza"):
    - IMPORTANT: This is ALWAYS a beverage pairing request - NEVER return food recipes
    - For ALL food item queries, return EXACTLY 3 beverage pairing recommendations
    - First check if "${query}" matches ANY of these common food categories:
        * Common foods: burger, pizza, taco, burrito, sushi, pasta, steak, salmon, chicken, curry, soup, salad
        * Cuisines: Mexican, Italian, Japanese, Chinese, Indian, Thai, French, Mediterranean, American
        * Meal types: breakfast, lunch, dinner, appetizer, dessert, snack
        * Components: meat, seafood, vegetable, fruit, grain, bread, dairy
    - ANY of the above should be identified as food items WITHOUT needing to check external sources
    - If not immediately recognized, THEN use allrecipes.com as a reference catalog to identify food items
    - YOUR RESPONSE SHOULD NEVER BE EMPTY for food items.
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
- For all search results, provide a "title", the "snippet" (as detailed above), and if directly applicable, a "filePath".
- The entire output MUST be a single, valid JSON array of objects. Each object in the array should represent one search result and have the keys: "title", "snippet", and "filePath" (use null for filePath if not applicable). If no suitable recipe is found according to the criteria above, return an empty JSON array: []. Do not include any text outside of this JSON array (e.g. no "Here are the results..." or markdown backticks around the JSON).
Example of a single item: {"title": "Example Cocktail Name", "snippet": "Ingredients: ingredient 1, ingredient 2. Instructions: step 1, step 2.", "filePath": null}`
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

        console.log("Raw Gemini API Response:", geminiResponse.data); // Added console log here

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
                // Return a single item indicating parse failure, or throw an error
                // For now, let's throw to be handled by the caller
                throw new Error('Failed to parse Gemini API response JSON.');
            }
        } else {
            console.warn("No valid text part found in Gemini response.");
            throw new Error('No valid content returned from Gemini API.');
        }
        
        const mappedResults = resultsFromApi.map((item: any, index: number) => ({
            id: item.id || `gemini-result-${index}-${Date.now()}`,
            title: item.title || 'Untitled Result',
            filePath: item.filePath || item.file_path, // Handles both snake_case and camelCase
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
        // Re-throw the error to be handled by the route handler in server.ts
        // Manual type guard for Axios errors
        if (error && typeof error === 'object' && 'isAxiosError' in error && (error as any).isAxiosError) {
            throw new Error(`Gemini API request failed: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error; // Re-throw other errors
    }
}   
