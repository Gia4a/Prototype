import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

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
                // Modified prompt text below
                text: `You are a helpful search assistant specializing in cocktails and liquors.
For the user query "${query}":
- If "${query}" is a specific cocktail name (e.g., "Mojito", "Old Fashioned"):
    - Prioritize finding multiple recipes.
    - From these recipes, select up to 3 results that have the most complete and detailed 'ingredients' and 'instructions'.
    - For these top results, ensure their 'snippet' field includes the full ingredients and instructions directly. If a source like liquor.com is available for a complete recipe, favor that.
    - If fewer than 3 complete recipes are found, return as many as possible that meet the completeness criteria.
- If "${query}" is a type of liquor (e.g., "Vodka", "Rum", "Gin", "Tequila", "Whiskey"):
    - Your primary goal is to find cocktail recipes that prominently feature "${query}".
    - For each cocktail recipe found (up to 3):
        - The "title" MUST be the specific name of the cocktail recipe detailed in the "snippet". Do NOT use "${query}" as the title for these cocktail recipes.
        - The "snippet" MUST contain the full list of ingredients and the complete step-by-step instructions for making the cocktail. Structure this clearly (e.g., "Ingredients: ..." followed by "Instructions: ...").
        - Prioritize recipes with clear, comprehensive ingredients and instructions.
    - If fewer than 3 such complete recipes are found, return as many as possible.
- For all search results, provide a "title", the "snippet" (as detailed above), and if directly applicable, a "filePath".
- The entire output MUST be a single, valid JSON array of objects. Each object in the array should represent one search result and have the keys: "title", "snippet", and "filePath" (use null for filePath if not applicable). Do not include any text outside of this JSON array (e.g. no "Here are the results..." or markdown backticks around the JSON).
Example of a single item: {"title": "Example Cocktail Name", "snippet": "Ingredients: ingredient 1, ingredient 2. Instructions: step 1, step 2.", "filePath": null}`
            }]
        }]
    };

    try {
        const geminiResponse = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        let resultsFromApi: any[] = [];
        if (geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            let responseText = geminiResponse.data.candidates[0].content.parts[0].text;

            const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
            const match = responseText.match(jsonRegex);
            if (match && match[1]) {
                responseText = match[1];
            }

            try {
                resultsFromApi = JSON.parse(responseText);
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
        
        return resultsFromApi.map((item: any, index: number) => ({
            id: item.id || `gemini-result-${index}-${Date.now()}`,
            title: item.title || 'Untitled Result',
            filePath: item.filePath || item.file_path, // Handles both snake_case and camelCase
            snippet: item.snippet || 'No snippet available.'
        }));

    } catch (error: any) {
        console.error('Error calling Gemini API in service:', error.response?.data || error.message);
        // Re-throw the error to be handled by the route handler in server.ts
        // Or wrap it in a custom error
        if (axios.isAxiosError(error)) {
            throw new Error(`Gemini API request failed: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error; // Re-throw other errors
    }
}