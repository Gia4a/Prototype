import React, { useState, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import CameraCapture from './CameraCapture';
import type { CameraCaptureHandle } from './CameraCapture';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Eye icon component
const EyeIcon = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
    <span
        onClick={disabled ? undefined : onClick}
        style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            width: 28,
            height: 28
        }}
    >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="12" rx="10" ry="6" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
    </span>
);

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
}

const SearchBar: React.FC<SearchBarProps> = ({ 
    onNewSuggestion, 
    onLoadingChange, 
    onError, 
    isLoading 
}) => {
    const [query, setQuery] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const cameraRef = useRef<CameraCaptureHandle>(null);

    // Helper function to process mixologist response
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

    // Call the mixologist Cloud Function
    const callMixologist = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            onError('Please enter a search term');
            return;
        }

        onLoadingChange(true);
        
        try {
            console.log('Calling mixologist with query:', searchQuery);
            
            const getMixologistSuggestion = httpsCallable<
                { query: string },
                MixologistResponse
            >(functions, 'getMixologistSuggestion');

            const result = await getMixologistSuggestion({ query: searchQuery.trim() });
            const responseData = result.data;

            console.log('Raw mixologist response:', responseData);
            
            // Process the response to handle food pairings and other special cases
            const processedResponse = processResponse(responseData);
            
            console.log('Processed response:', processedResponse);

            // Always pass the processed response
            onNewSuggestion(processedResponse, searchQuery);
            
        } catch (error: any) {
            console.error("Error calling mixologist function:", error);
            
            // Create a fallback response for display
            const fallbackResponse: MixologistResponse = {
                originalQuery: searchQuery,
                suggestion: `Sorry, I couldn't process your request for "${searchQuery}". Please try again.`,
                title: 'Search Error',
                searchType: 'error'
            };
            
            onNewSuggestion(fallbackResponse, searchQuery);
        } finally {
            onLoadingChange(false);
        }
    };

    const handleCameraCapture = (imageData: string) => {
        if (cameraRef.current) cameraRef.current.stopCamera();
        setShowCamera(false);
        if (imageData) {
            // For now, treat camera capture as a general request
            callMixologist("Analyze this drink or food item from image");
        }
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

    const handleCameraClick = () => {
        if (!isLoading) {
            setShowCamera(false);
            setTimeout(() => setShowCamera(true), 0);
        }
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            <form onSubmit={handleSubmit} style={{ 
                display: 'inline-block', 
                position: 'relative', 
                width: 'clamp(280px, 70vw, 390px)',
                maxWidth: 'calc(100vw - 80px)'
            }}>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Ask the Mixologist (e.g., Pho, vodka, Old Fashioned recipe)"
                    style={{
                        padding: 'clamp(8px, 2vw, 10px) clamp(40px, 12vw, 50px) clamp(8px, 2vw, 10px) clamp(8px, 2vw, 10px)',
                        width: '100%',
                        boxSizing: 'border-box',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: 'clamp(14px, 4vw, 16px)'
                    }}
                    disabled={isLoading}
                    autoComplete="off"
                />
                <div style={{
                    position: 'absolute',
                    right: 'clamp(8px, 2vw, 10px)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <EyeIcon onClick={handleCameraClick} disabled={isLoading} />
                </div>
            </form>

            {/* Camera Modal */}
            {showCamera && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onClick={() => {
                        if (cameraRef.current) cameraRef.current.stopCamera();
                        setShowCamera(false);
                    }}
                >
                    <div
                        style={{
                            background: '#222',
                            padding: 24,
                            borderRadius: 12,
                            boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
                            position: 'relative',
                            minWidth: 320,
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => {
                                if (cameraRef.current) cameraRef.current.stopCamera();
                                setShowCamera(false);
                            }}
                            style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                fontSize: 24,
                                cursor: 'pointer',
                                zIndex: 2
                            }}
                            aria-label="Close camera preview"
                        >
                            ×
                        </button>
                        <CameraCapture ref={cameraRef} onCapture={handleCameraCapture} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;