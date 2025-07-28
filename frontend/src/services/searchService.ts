// filepath: gemini-ai-search-app/frontend/src/services/searchService.ts
import axios from 'axios';
import type { SearchResult } from '../components/ResultsPopup';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

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
        // Ensure BACKEND_API_URL is defined
        if (!BACKEND_API_URL) {
            throw new Error('VITE_BACKEND_API_URL is not defined. Please set it in your environment variables or .env file.');
        }
        // Ensure the request always goes to /search endpoint
        const apiUrl = BACKEND_API_URL.endsWith('/search') ? BACKEND_API_URL : `${BACKEND_API_URL.replace(/\/$/, '')}/search`;
        const response = await axios.post<BackendResponse>(apiUrl, payload);
        return response.data;
    } catch (error) {
        console.error('Error fetching search results from backend:', error);
        if (axios.isAxiosError(error) && error.response) {
            const errorMessage = error.response.data?.message || error.response.data?.details || 'Failed to fetch results from backend';
            throw new Error(errorMessage);
        }
        throw new Error('An unknown error occurred while fetching results.');
    }
};