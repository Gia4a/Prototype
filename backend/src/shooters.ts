import axios from 'axios';

// Type for the Gemini Vision API response (simplified)
interface GeminiVisionResponse {
    candidates: Array<{
        content: { parts: Array<{ text: string }> }
    }>;
}

export interface ShooterResult {
    query: string;
    description: string;
    detectedItems?: string[];
}

/**
 * Calls Gemini Vision API with an image and returns a structured shooter result.
 * @param imageBase64 - The image as a base64 string (no data: prefix)
 * @returns ShooterResult or null if not found
 */
export async function getShooterFromImage(imageBase64: string): Promise<ShooterResult | null> {
    // Replace with your actual Gemini API endpoint and key
    const GEMINI_API_URL = process.env.GEMINI_API_URL || '';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

    if (!GEMINI_API_URL || !GEMINI_API_KEY) {
        throw new Error('Gemini API URL or KEY not set');
    }

    try {
        const response = await axios.post<GeminiVisionResponse>(
            GEMINI_API_URL,
            {
                instances: [
                    {
                        image: { base64: imageBase64 },
                        prompt:
                            'Identify the liquor (brand/type) in this image. Then recommend a shooter recipe that uses this liquor, including the recipe title, ingredients, and instructions. Format the response as:\nLiquor: ...\nShooter: ...\nIngredients: ...\nInstructions: ...'
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GEMINI_API_KEY}`
                }
            }
        );

        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) return null;

        // Parse the Gemini response for liquor, shooter, ingredients, and instructions
        const liquorMatch = text.match(/Liquor:\s*(.*)/i);
        const shooterMatch = text.match(/Shooter:\s*(.*)/i);
        const ingredientsMatch = text.match(/Ingredients:\s*([\s\S]*?)(?=\nInstructions:|$)/i);
        const instructionsMatch = text.match(/Instructions:\s*([\s\S]*)/i);

        const liquor = liquorMatch ? liquorMatch[1].trim() : '';
        const shooter = shooterMatch ? shooterMatch[1].trim() : '';
        const ingredients = ingredientsMatch ? ingredientsMatch[1].trim() : '';
        const instructions = instructionsMatch ? instructionsMatch[1].trim() : '';

        // Compose a description and detectedItems
        const description = `Shooter: ${shooter}\nIngredients:\n${ingredients}\n\nInstructions:\n${instructions}`.trim();
        let detectedItems: string[] | undefined = undefined;
        if (ingredients) {
            detectedItems = ingredients.split(/,|\n|\*/).map(s => s.trim()).filter(Boolean);
        }

        // Use liquor as the query, or fallback to shooter
        const query = liquor || shooter || 'Unknown';

        return { query, description, detectedItems };
    } catch (err) {
        console.error('Gemini Vision API error:', err);
        return null;
    }
}
