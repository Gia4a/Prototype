// filepath: gemini-ai-search-app/frontend/src/services/searchService.ts
import axios from 'axios';
import type { SearchResult } from '../components/ResultsPopup';

const BACKEND_API_URL = 'http://localhost:3001/api/search';

// Define the structure for the best recipe object
export interface BestRecipe {
    title: string;
    recipe: string;
}

// Update BackendResponse to use BestRecipe
export interface BackendResponse {
    results: SearchResult[];
    formattedRecipe?: BestRecipe | null; // formattedRecipe is now an object or null
}

export const fetchSearchResultsFromBackend = async (query: string): Promise<BackendResponse> => {
    try {
        const response = await axios.get<BackendResponse>(BACKEND_API_URL, {
            params: { q: query }
        });
        // Return the entire data object from the backend
        return response.data;
    } catch (error) {
        console.error('Error fetching search results from backend:', error);
        if (axios.isAxiosError(error) && error.response) {
            // Try to parse the error response from backend if available
            const errorMessage = error.response.data?.message || error.response.data?.details || 'Failed to fetch results from backend';
            throw new Error(errorMessage);
        }
        throw new Error('An unknown error occurred while fetching results.');
    }
};