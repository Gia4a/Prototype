// filepath: gemini-ai-search-app/frontend/src/services/searchService.ts
import axios from 'axios';
import type { SearchResult } from '../components/ResultsPopup'; // Import the interface

// The URL of your backend API. Adjust if your backend runs on a different port.
const BACKEND_API_URL = 'http://localhost:3001/api/search'; // Example backend URL

export const fetchSearchResultsFromBackend = async (query: string): Promise<SearchResult[]> => {
    try {
        const response = await axios.get(BACKEND_API_URL, {
            params: { q: query }
        });
        // Assuming your backend returns data in a property called 'results'
        // and that it matches the SearchResult[] structure.
        return response.data.results || response.data;
    } catch (error) {
        console.error('Error fetching search results from backend:', error);
        // You might want to throw a more specific error or handle it differently
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to fetch results from backend');
        }
        throw new Error('An unknown error occurred while fetching results.');
    }
};