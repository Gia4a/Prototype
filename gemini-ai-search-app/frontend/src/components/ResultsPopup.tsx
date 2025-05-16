// filepath: gemini-ai-search-app/frontend/src/components/ResultsPopup.tsx
import React, { useEffect } from 'react';
import './ResultsPopup.css';

export interface SearchResult {
    id: string;
    title: string;
    filePath?: string;
    snippet: string;
}

interface BestRecipe {
    title: string;
    recipe: string;
}

interface ResultsPopupProps {
    searchQuery: string;
    results: SearchResult[];
    formattedRecipe: BestRecipe | null;
    error?: string | null;
    onClose: () => void;
    visible: boolean;
}

// Common food items to check against for better user messaging
const FOOD_ITEMS = ["steak", "pasta", "chocolate", "seafood", "chicken", "beef", "pork", "fish", "lamb", "dessert"];

const ResultsPopup: React.FC<ResultsPopupProps> = ({ searchQuery, results, formattedRecipe, error, onClose, visible }) => {

    // Check if the query is likely a food item
    const isLikelyFoodItem = () => {
        if (!searchQuery) return false;
        return FOOD_ITEMS.includes(searchQuery.toLowerCase().trim());
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (visible) {
            document.addEventListener('keydown', handleKeyDown);
        } else {
            document.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [visible, onClose]);

    if (!visible) {
        return null;
    }

    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    // Function to capitalize first letter of each word for the title
    const capitalizeTitle = (title: string) => {
        return title.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Renders pairing items in a more attractive way
    const renderPairingResults = () => {
        return (
            <div className="pairing-results">
                {results.map((result) => (
                    <div key={result.id} className="pairing-item">
                        <h4>{result.title}</h4>
                        <div className="pairing-content">
                            {result.snippet}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="results-popup-overlay" onClick={handleOverlayClick}>
            <div className="results-popup-content">
                <button onClick={onClose} className="results-popup-close-button">
                    &times;
                </button>

                {/* Display the search query as a bold title */}
                {searchQuery && (
                    <h2 className="popup-main-title">
                        <strong>{capitalizeTitle(searchQuery)}</strong>
                    </h2>
                )}
                
                {formattedRecipe ? (
                    <>
                        <h3>{capitalizeTitle(formattedRecipe.title)}</h3>
                        <pre className="formatted-recipe-text" style={{ whiteSpace: 'pre-wrap', textAlign: 'left', color: '#333' }}> 
                            {formattedRecipe.recipe}
                        </pre>
                    </>
                ) : error ? (
                    <>
                        <h3>Error</h3>
                        <p style={{ color: 'red' }}>{error}</p>
                        {results && results.length > 0 && <hr />} 
                    </>
                ) : (
                    <>
                        <h3>{results && results.length > 0 ? "Beverage Pairings" : "Search Results"}</h3>
                        {results && results.length > 0 ? (
                            // Use the new pairing renderer for better display
                            renderPairingResults()
                        ) : (
                            <div className="no-results-message">
                                {isLikelyFoodItem() ? (
                                    <>
                                        <p>No beverage pairings found for "<strong>{capitalizeTitle(searchQuery)}</strong>".</p>
                                        <p>Try searching again to discover wine, spirit, and cocktail recommendations that complement {searchQuery}.</p>
                                    </>
                                ) : (
                                    <p>No results found for "<strong>{capitalizeTitle(searchQuery)}</strong>".</p>
                                )}
                            </div>
                        )}
                    </>
                )}
                {error && !formattedRecipe && results && results.length > 0 && (
                     <>
                        <h3>Search Results (alongside error)</h3>
                        <ul>
                            {results.map((result) => (
                                <li key={result.id} className="result-item">
                                    <h4>{result.title}</h4>
                                    {result.filePath && (
                                        <p className="result-file-path">
                                            Path: {result.filePath}
                                        </p>
                                    )}
                                    <p className="result-snippet">{result.snippet}</p>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResultsPopup;