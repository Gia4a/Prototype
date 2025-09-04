import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchMixologistSuggestion } from '../api';

// Interfaces
interface MixologistResponse {
    originalQuery: string;
    suggestion: string;
    title?: string;
    content?: string;
    filePath?: string;
    results?: any[];
    searchType?: string;
    snippet?: string;
    why?: string;
}

interface SearchBarProps {
    onNewSuggestion: (suggestion: MixologistResponse | string | null, query?: string) => void;
    onLoadingChange: (loading: boolean) => void;
    onError: (error: string) => void;
    isLoading: boolean;
    onUpgradeRequest?: (originalQuery: string, upgradeType: string) => void;
    showCamera: boolean; // Keep for compatibility but not used
    onCameraToggle: () => void; // Keep for compatibility but not used
}

const SearchBar: React.FC<SearchBarProps> = ({ 
    onNewSuggestion, 
    onLoadingChange, 
    onError 
}) => {
    const [query, setQuery] = useState('');

    const processResponse = (responseData: MixologistResponse): MixologistResponse => {
        // Check if this is a food pairing response with structured data in results
        if (responseData.results && responseData.results.length > 0) {
            const firstResult = responseData.results[0];
            
            // Check if the first result has the structured pairing data we need
            if (firstResult.winePairing && firstResult.spiritPairing && firstResult.beerPairing) {
                console.log('Found structured food pairing data in results');
                
                // Return the structured result directly, preserving the original query
                return {
                    ...firstResult,
                    originalQuery: responseData.originalQuery,
                    filePath: "willowpark.net" // Force food pairing detection
                };
            }
            
            // Check if it's a food pairing based on filePath or content patterns
            const isFoodPairing = firstResult.filePath === "willowpark.net" ||
                                 firstResult.snippet?.toLowerCase().includes('pairing notes:') ||
                                 firstResult.title?.toLowerCase().includes('perfect pairing for') ||
                                 responseData.filePath === "willowpark.net";
            
            if (isFoodPairing) {
                console.log('Detected food pairing response, parsing snippet');
                
                // Parse the snippet to extract pairing information
                const snippet = firstResult.snippet || responseData.snippet || '';
                const parsedPairings = parseSnippetForPairings(snippet);
                
                return {
                    ...firstResult,
                    originalQuery: responseData.originalQuery,
                    filePath: "willowpark.net",
                    winePairing: parsedPairings.wine,
                    spiritPairing: parsedPairings.spirit,
                    beerPairing: parsedPairings.beer
                };
            }
        }
        
        // Return original response if no special processing needed
        return responseData;
    };

    // Helper function to parse snippet for pairing information
    const parseSnippetForPairings = (snippet: string) => {
        const defaultPairings = {
            wine: { name: "Wine Selection", notes: "Wine pairing information not available." },
            spirit: { name: "Spirit Selection", notes: "Spirit pairing information not available." },
            beer: { name: "Beer Selection", notes: "Beer pairing information not available." }
        };

        if (!snippet) return defaultPairings;

        // Extract wine pairing
        const wineMatch = snippet.match(/Wine Pairing:\s*([^.]+)\.?\s*Wine Notes:\s*([^.]*\.(?:[^.]*\.)*)/i);
        if (wineMatch) {
            defaultPairings.wine = {
                name: wineMatch[1].trim(),
                notes: wineMatch[2].trim()
            };
        }

        // Extract spirit pairing  
        const spiritMatch = snippet.match(/Spirit Pairing:\s*([^.]+)\.?\s*Spirit Notes:\s*([^.]*\.(?:[^.]*\.)*)/i);
        if (spiritMatch) {
            defaultPairings.spirit = {
                name: spiritMatch[1].trim(),
                notes: spiritMatch[2].trim()
            };
        }

        // Extract beer pairing
        const beerMatch = snippet.match(/Beer Pairing:\s*([^.]+)\.?\s*Beer Notes:\s*([^.]*\.(?:[^.]*\.)*)/i);
        if (beerMatch) {
            defaultPairings.beer = {
                name: beerMatch[1].trim(),
                notes: beerMatch[2].trim()
            };
        }

        return defaultPairings;
    };

    // TanStack Query mutation for mixologist suggestion
    const mutation = useMutation({
        mutationFn: (searchQuery: string) => fetchMixologistSuggestion(searchQuery.trim()) as Promise<MixologistResponse>,
        onSuccess: (responseData: MixologistResponse) => {
            const processedResponse = processResponse(responseData);
            onNewSuggestion(processedResponse, query);
        },
        onError: (error) => {
            console.error('Mixologist API error:', error);
            const fallbackResponse: MixologistResponse = {
                originalQuery: query,
                suggestion: `Sorry, I couldn't process your request for "${query}". Please try again.`,
                title: 'Search Error',
                searchType: 'error'
            };
            onNewSuggestion(fallbackResponse, query);
            onError(`Failed to get suggestion for "${query}"`);
        },
        onSettled: () => {
            onLoadingChange(false);
        }
    });

    const callMixologist = (searchQuery: string) => {
        if (!searchQuery.trim()) {
            onError('Please enter a search term');
            return;
        }
        onLoadingChange(true);
        mutation.mutate(searchQuery);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (query.trim()) {
            callMixologist(query);
        }
    };

    return (
        <div className="universal-card-container" style={{ 
            position: 'relative', 
            margin: '0 auto', 
            marginBottom: '20px' 
        }}>
            <form onSubmit={handleSubmit} style={{ 
                display: 'inline-block', 
                width: '100%',
                maxWidth: '100%'
            }}>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Ask the Mixologist (e.g., Pho, vodka, Old Fashioned recipe)"
                    style={{
                        padding: 'clamp(8px, 2vw, 10px)',
                        width: '100%',
                        boxSizing: 'border-box',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: 'clamp(14px, 4vw, 16px)'
                    }}
                    disabled={mutation.isPending}
                    autoComplete="off"
                />
            </form>
        </div>
    );
};

export default SearchBar;