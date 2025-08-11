/**
 * Stub for getShooterFromImage. Accepts image data and returns null or a dummy shooter recipe.
 * Replace with actual image recognition logic as needed.
 */
export async function getShooterFromImage(imageData: string): Promise<{ name: string; ingredients: string[] } | null> {
    // TODO: Implement image recognition and Gemini API call
    // For now, return null or a dummy value for testing
    return null;
}
import axios from 'axios';

// The type for the Gemini API text generation response.
interface GeminiTextResponse {
    candidates: Array<{
        content: { parts: Array<{ text: string }> }
    }>;
}

// Defines the structure for the shooter recipe that will be returned.
export interface ShooterRecipe {
    name: string;
    ingredients: string[];
}

/**
 * Calls a Gemini API to get a shooter recipe based on a liquor name.
 * @param liquorName - The name of the liquor to search for.
 * @returns A ShooterRecipe object or null if not found.
 */
export async function getShooterFromLiquor(liquorName: string): Promise<ShooterRecipe | null> {
    const GEMINI_API_URL = process.env.GEMINI_API_URL || '';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

    if (!GEMINI_API_URL || !GEMINI_API_KEY) {
        // Log an error but don't stop the application
        console.error('Gemini API URL or KEY not set');
        return null;
    }

    try {
        const prompt =
            `Recommend a shooter recipe that uses ${liquorName}. ` +
            `Include the recipe title, a list of ingredients, and instructions. ` +
            `Format the response strictly as:\nShooter: [Recipe Title]\nIngredients:\n[Ingredient 1]\n[Ingredient 2]\n...\nInstructions: [Step 1] [Step 2]...`;

        const response = await axios.post<GeminiTextResponse>(
            GEMINI_API_URL,
            {
                contents: [{ parts: [{ text: prompt }] }],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GEMINI_API_KEY}`
                }
            }
        );

        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) {
            console.error('Gemini API returned no text.');
            return null;
        }

        // Parse the Gemini response using regular expressions.
        const shooterMatch = text.match(/Shooter:\s*(.*)/i);
        const ingredientsMatch = text.match(/Ingredients:\s*([\s\S]*?)(?=\nInstructions:|$)/i);
        const instructionsMatch = text.match(/Instructions:\s*([\s\S]*)/i);

        const shooter = shooterMatch ? shooterMatch[1].trim() : '';
        const ingredientsText = ingredientsMatch ? ingredientsMatch[1].trim() : '';
        // The instructions are not used in the server.ts response but are
        // good to have for debugging or future use.
        // const instructions = instructionsMatch ? instructionsMatch[1].trim() : '';

        if (!shooter || !ingredientsText) {
            console.warn(`Could not parse shooter recipe from Gemini response for "${liquorName}".`);
            return null;
        }

        // Split the ingredients string into an array, filter out empty strings.
        const ingredients = ingredientsText.split(/,|\n|\*/).map((s: string) => s.trim()).filter(Boolean);

        return { name: shooter, ingredients };

    } catch (err) {
        console.error(`Gemini API error while fetching shooter for "${liquorName}":`, err);
        return null;
    }
}
