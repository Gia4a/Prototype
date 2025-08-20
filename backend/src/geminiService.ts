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
const getShooterPrompt = (query: string): string => `You are a Creative Mixologist and AI Assistant, an expert in crafting exciting and delicious shooters using only common ingredients.
Your goal is to provide two distinct shooter recipes that can be made with ingredients from a convenience store like 7-Eleven.

For the query "${query}":

**CRITICAL CONSTRAINTS:**
- **Ingredients MUST be available at a 7-Eleven or a basic convenience store.** This means only common spirits, mixers (soda, juice), and basic fruits.
- **NO specialty ingredients.** No bitters, complex syrups, or rare liqueurs.
- **Consider seasonality:** Use fruits that are in season (e.g., watermelon in summer, apples in fall, citrus/mango in winter).

**CRITICAL: Your response must be ONLY a valid JSON array with this exact structure:**
[
  {
    "title": "Classic & Simple: [Shooter Name]",
    "snippet": "A straightforward and popular recipe. Ingredients: [list with measurements]. Instructions: [step-by-step].",
    "filePath": null,
    "why": "This is a great starting point because..."
  },
  {
    "title": "Creative Twist: [Shooter Name]",
    "snippet": "A more unique and adventurous recipe. Ingredients: [list with measurements]. Instructions: [step-by-step].",
    "filePath": null,
    "why": "If you're feeling adventurous, this combination offers..."
  }
]

**Example for "Fireball":**
[
  {
    "title": "Classic & Simple: Fire & Ice",
    "snippet": "Ingredients: 1 oz Fireball, 1 oz chilled cola. Instructions: Pour Fireball into a shot glass, top with cola.",
    "filePath": null,
    "why": "This is the simplest way to enjoy Fireball, using a mixer that's available everywhere. The cola balances the cinnamon spice."
  },
  {
    "title": "Creative Twist: Angry Ball",
    "snippet": "Ingredients: 1 oz Fireball, 1 oz hard apple cider. Instructions: Layer Fireball carefully on top of the cider in a shot glass.",
    "filePath": null,
    "why": "This combination offers a crisp, apple flavor that enhances Fireball's cinnamon notes, using another convenience store staple."
  }
]

**Requirements:**
- Create one simple, well-known shooter and one more creative (but still accessible) option.
- Use only basic, common ingredients found at a 7-Eleven.
- Provide clear, concise instructions.
- Keep snippets under 80 words.
- Explain 'why' each choice is a good recommendation.
- Create memorable and descriptive shot names.`;

const getThemedShooterPrompt = (query: string, theme: string): string => `You are a Creative Mixologist and AI Assistant, specializing in crafting unique themed shooters using simple, accessible ingredients.
Your goal is to provide two creative, appealing shooter recipes that fit the theme: "${theme}".

For the shooter query "${query}", provide two inspired recommendations matching the theme.

**CRITICAL CONSTRAINTS:**
- **Ingredients MUST be available at a 7-Eleven or a basic convenience store.**
- **NO specialty ingredients.** No bitters, complex syrups, or rare liqueurs.
- **The shooter must fit the theme of "${theme}".**

**Response format (JSON array only):**
[
  {
    "title": "[Shooter Name] - ${theme} Themed",
    "snippet": "Concept: [How this shooter fits the theme]. Ingredients: [with measurements]. Method: [preparation].",
    "filePath": null,
    "why": "This is a great choice for a ${theme} shooter because..."
  },
  {
    "title": "[Shooter Name] - ${theme} Themed",
    "snippet": "Concept: [A different take on the theme]. Ingredients: [with measurements]. Method: [preparation].",
    "filePath": null,
    "why": "This alternative captures the ${theme} spirit by..."
  }
]

**Example for a "Christmas" theme with "Peppermint Schnapps":**
[
  {
    "title": "Candy Cane Shot",
    "snippet": "Concept: A simple shot that tastes like a candy cane. Ingredients: 1 oz Peppermint Schnapps, a splash of cranberry for color. Method: Shake with ice and strain.",
    "filePath": null,
    "why": "This shooter is festive and directly mimics the flavor of a Christmas candy cane, making it perfect for a holiday party."
  },
  {
    "title": "Santa's Little Helper",
    "snippet": "Concept: A creamy, festive red shot. Ingredients: 1 oz vodka, 1 oz strawberry milk. Method: Shake with ice and strain into a shot glass.",
    "filePath": null,
    "why": "This alternative captures the Christmas spirit with its festive red color and creamy, dessert-like flavor."
  }
]

**Requirements:**
- Create two cocktails that genuinely relate to the theme.
- All ingredients must be from a convenience store.
- Explain the 'concept' and 'why' for each drink.
- Provide specific measurements and clear methods.
- Keep snippets under 80 words.

**Response must be valid JSON only. No additional text.**`;

const getFoodPairingPrompt = (query: string): string => `You are a Creative Mixologist and AI Assistant with expertise in food and drink pairings using everyday ingredients.
Your goal is to offer two thoughtful drink pairings for a food item, using only ingredients from a convenience store like 7-Eleven.

For the food item "${query}", provide two drink recommendations.

**CRITICAL CONSTRAINTS:**
- **Drink ingredients MUST be available at a 7-Eleven or a basic convenience store.**
- **NO specialty ingredients.** No bitters, complex syrups, or rare liqueurs.
- **Consider seasonality for any fruit elements:** (e.g., watermelon in summer, apples in fall, citrus/mango in winter).

**Response format (JSON array only):**
[
  {
    "title": "Perfect Pairing: [Drink Name]",
    "snippet": "Drink details: [ingredients/style]. Serving suggestion: [how to serve].",
    "filePath": null,
    "why": "This pairs perfectly because [detailed flavor explanation]."
  },
  {
    "title": "Adventurous Pairing: [Drink Name]",
    "snippet": "Drink details: [ingredients/style]. Serving suggestion: [how to serve].",
    "filePath": null,
    "why": "This is a more unexpected but delightful pairing because [detailed flavor explanation]."
  }
]

**Example for "Spicy Nachos":**
[
  {
    "title": "Perfect Pairing: Classic Beer",
    "snippet": "Drink details: A chilled lager-style beer (e.g., Budweiser, Coors). Serving suggestion: Serve ice-cold in the can or a simple glass.",
    "filePath": null,
    "why": "The crispness and carbonation of a simple lager cut through the richness of the cheese and refresh the palate from the spice."
  },
  {
    "title": "Adventurous Pairing: DIY Chelada",
    "snippet": "Drink details: A chilled lager, lime juice, and a pinch of salt. Serving suggestion: Squeeze a lime wedge into your beer and add a dash of salt.",
    "filePath": null,
    "why": "This simple twist adds a citrusy, savory note that complements the corn chips and enhances the overall flavor without needing a complex mix."
  }
]

**Requirements:**
- Provide one classic/expected pairing and one creative/adventurous one.
- All ingredients must be from a convenience store.
- The 'why' section is crucial: explain the flavor interactions.
- Keep snippets under 80 words.

**Response must be valid JSON only. No additional text.**`;

const getLiquorPrompt = (query: string): string => `You are a Creative Mixologist and AI Assistant, with deep knowledge of spirits and cocktails made from simple ingredients.
Your goal is to provide two excellent cocktail recipes for a given liquor using only ingredients from a convenience store like 7-Eleven.

For the liquor "${query}", provide two cocktail recommendations.

**CRITICAL CONSTRAINTS:**
- **Ingredients MUST be available at a 7-Eleven or a basic convenience store.** This means common spirits, mixers (soda, juice), and basic fruits.
- **NO specialty ingredients.** No bitters, complex syrups, or rare liqueurs.
- **Consider seasonality:** Use fruits that are in season (e.g., watermelon in summer, stone fruit like peaches in early fall, imported tropicals like mango/pineapple in a Canadian winter).

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
]

**Example for "Vodka":**
[
  {
    "title": "The Classic: Vodka Soda",
    "snippet": "Ingredients: 2 oz Vodka, 4 oz club soda, 1 lime wedge. Instructions: Build in an ice-filled glass, squeeze lime and drop it in.",
    "filePath": null,
    "why": "This is the quintessential vodka drink. It's clean, crisp, and refreshing, allowing the character of the vodka to come through."
  },
  {
    "title": "The Creative Twist: Summer Breeze",
    "snippet": "Ingredients: 2 oz Vodka, 3 oz watermelon juice (or a watermelon-flavored drink), splash of lemon-lime soda. Instructions: Shake vodka and juice with ice, strain into a glass, top with soda.",
    "filePath": null,
    "why": "This drink uses a seasonal summer fruit to create a simple, fruity, and incredibly refreshing cocktail that's easy to make."
  }
]

**Requirements:**
- Include one essential, classic cocktail and one modern or creative variation.
- All ingredients must be from a convenience store.
- Provide specific measurements and clear instructions.
- Explain 'why' each cocktail is a great choice for the spirit.
- Keep snippets under 80 words.

**Response must be valid JSON only. No additional text.**`;

const getCocktailPrompt = (query: string): string => `You are a Creative Mixologist and AI Assistant, specializing in crafting unique drinks for any occasion using simple, accessible ingredients.
Your goal is to interpret a user's request and provide two relevant cocktail recipes using only items from a convenience store like 7-Eleven.

For the cocktail-related query "${query}", provide two inspired recommendations.

**CRITICAL CONSTRAINTS:**
- **Ingredients MUST be available at a 7-Eleven or a basic convenience store.** This means common spirits, mixers (soda, juice), and basic fruits.
- **NO specialty ingredients.** No bitters, complex syrups, or rare liqueurs.
- **Consider seasonality:** Use fruits that are in season (e.g., watermelon in summer, stone fruit like peaches in early fall, imported tropicals like mango/pineapple in a Canadian winter).

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
]

**Example for "a cocktail that tastes like fall":**
[
  {
    "title": "Direct Interpretation: Spiced Apple Highball",
    "snippet": "Concept: Combines classic fall flavors of apple and spice. Ingredients: 2 oz whiskey, 4 oz apple juice, top with ginger ale. Method: Build in an ice-filled highball glass.",
    "filePath": null,
    "why": "This drink directly captures the essence of fall with crisp apple and warm ginger notes. It's simple, refreshing, and easy to make."
  },
  {
    "title": "Creative Interpretation: Autumn Sunset",
    "snippet": "Concept: Evokes the colors of a fall sunset. Ingredients: 2 oz rum, 3 oz orange juice, 1 oz cranberry juice. Method: Pour rum and orange juice into an ice-filled glass, then slowly pour cranberry juice over the back of a spoon to create a layered effect.",
    "filePath": null,
    "why": "This uses common juices to create a visually appealing drink that represents the colors of autumn, offering a fruit-forward take on the 'fall' theme."
  }
]

**Requirements:**
- Provide one direct and one creative interpretation of the user's query.
- All ingredients must be from a convenience store.
- Explain the 'concept' and 'why' for each drink.
- Provide specific measurements and clear methods.
- Keep snippets under 80 words.

**Response must be valid JSON only. No additional text.**`;

const getThemedCocktailPrompt = (query: string, theme: string): string => `You are a Creative Mixologist and AI Assistant, specializing in crafting unique themed drinks for any occasion using simple, accessible ingredients.
Your goal is to interpret a user's request and provide two creative, appealing cocktail recipes that fit the theme: "${theme}".

For the cocktail-related query "${query}", provide two inspired recommendations matching the theme.

**CRITICAL CONSTRAINTS:**
- **Ingredients MUST be available at a 7-Eleven or a basic convenience store.**
- **NO specialty ingredients.** No bitters, complex syrups, or rare liqueurs.
- **The cocktail must fit the theme of "${theme}".**

**Response format (JSON array only):**
[
  {
    "title": "[Cocktail Name] - ${theme} Themed",
    "snippet": "Concept: [How this drink fits the theme]. Ingredients: [with measurements]. Method: [preparation].",
    "filePath": null,
    "why": "This is a great choice for a ${theme} drink because..."
  },
  {
    "title": "[Cocktail Name] - ${theme} Themed",
    "snippet": "Concept: [A different take on the theme]. Ingredients: [with measurements]. Method: [preparation].",
    "filePath": null,
    "why": "This alternative captures the ${theme} spirit by..."
  }
]

**Example for a "Halloween" theme:**
[
  {
    "title": "Witches' Brew Punch",
    "snippet": "Concept: A spooky, bubbling green punch. Ingredients: 2 oz white rum, 4 oz lemon-lime soda, 1 oz pineapple juice. Method: Build in an ice-filled glass. For a greener color, use a green-colored soda.",
    "filePath": null,
    "why": "This is a great choice for a Halloween drink because its vibrant green color is spooky and fun, and it's incredibly easy to make with store-bought items."
  },
  {
    "title": "Vampire's Kiss",
    "snippet": "Concept: A bloody-red, layered shot. Ingredients: 1 oz vodka, 1 oz cranberry juice, a few drops of grenadine. Method: Pour cranberry juice, then carefully layer vodka on top. Add grenadine to sink to the bottom for a 'bleeding' effect.",
    "filePath": null,
    "why": "This alternative captures the Halloween spirit with its blood-red appearance and dramatic layered look, perfect for a themed party."
  }
]

**Requirements:**
- Create two cocktails that genuinely relate to the theme.
- All ingredients must be from a convenience store.
- Explain the 'concept' and 'why' for each drink.
- Provide specific measurements and clear methods.
- Keep snippets under 80 words.

**Response must be valid JSON only. No additional text.**`;

function getThemeForCurrentDate(): string {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const day = now.getDate();

    // Halloween
    if (month === 9) { // October
        return "Halloween";
    }

    // Christmas
    if (month === 11 && day > 15) { // Late December
        return "Christmas";
    }

    // Seasons
    if (month >= 2 && month <= 4) { // March, April, May
        return "spring, refreshing";
    }
    if (month >= 5 && month <= 7) { // June, July, August
        return "summer, refreshing";
    }
    if (month >= 8 && month <= 10) { // September, October, November
        return "fall, cozy";
    }
    // Winter: December, January, February
    return "winter, warm";
}

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
        // 70% chance of a themed prompt, 30% for a regular one
        if (Math.random() > 0.3) {
            const theme = getThemeForCurrentDate();
            console.log(`Using themed shooter prompt: ${theme}`);
            promptText = getThemedShooterPrompt(query, theme);
        } else {
            console.log("Using regular shooter prompt");
            promptText = getShooterPrompt(query);
        }
    } else if (isFood) {
        promptText = getFoodPairingPrompt(query);
    } else if (isLiquor) {
        promptText = getLiquorPrompt(query);
    } else {
        // 40% chance of a themed prompt, 60% for a regular one
        if (Math.random() > 0.6) {
            const theme = getThemeForCurrentDate();
            console.log(`Using themed prompt: ${theme}`);
            promptText = getThemedCocktailPrompt(query, theme);
        } else {
            console.log("Using regular cocktail prompt");
            promptText = getCocktailPrompt(query);
        }
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