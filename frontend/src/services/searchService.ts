// filepath: gemini-ai-search-app/frontend/src/services/searchService.ts
import axios from 'axios';
import type { SearchResult } from '../components/ResultsPopup';


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

export const fetchSearchResultsFromBackend = async (query: string, imageData?: string): Promise<BackendResponse> => {
    try {
        // Always use POST to send both query and image (if available)
        const payload: { query: string; image?: string; timestamp: number } = {
            query,
            timestamp: Date.now(),
        };
        if (imageData && imageData.startsWith('data:image/')) {
            payload.image = imageData;
        }
        // Use /api/search to match backend route
        const response = await axios.post<BackendResponse>('/api/search', payload);
        return response.data;
    } catch (error: unknown) {
        if ((error as any)?.isAxiosError) {
            const axiosError = error as any;
            const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.details || 'Failed to fetch results from backend';
            throw new Error(errorMessage);
        } else if (error instanceof Error) {
            console.error('Error fetching search results from backend:', error.message);
            throw error;
        } else {
            console.error('Unknown error fetching search results from backend:', String(error));
            throw new Error('Unknown error fetching search results from backend');
        }
    }
};
