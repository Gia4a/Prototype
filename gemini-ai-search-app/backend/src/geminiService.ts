import axios from 'axios';

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
                // Modified prompt text below
                text: `For the query "${query}", please provide search results. If you find a recipe for "${query}" on liquor.com, try to include its ingredients and instructions directly in the snippet for that result. For all results, include a title, a brief snippet, and if applicable, a file path. Format the entire output as a JSON array.`
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