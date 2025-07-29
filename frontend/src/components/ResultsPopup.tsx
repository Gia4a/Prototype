// filepath: gemini-ai-search-app/frontend/src/components/ResultsPopup.tsx
import React, { useEffect } from 'react';
import './ResultsPopup.css';
import { getSearchType } from '../../../shared/constants';

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

const ResultsPopup: React.FC<ResultsPopupProps> = ({ searchQuery, results, formattedRecipe, error, onClose, visible }) => {

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
        console.log("Rendering pairing results:", results); // Debug log
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

    // Render cocktail recipe results
    const renderCocktailResults = () => {
        console.log("Rendering cocktail results:", results); // Debug log
        return (
            <div className="cocktail-results">
                {results.map((result) => (
                    <div key={result.id} className="cocktail-item">
                        <h4>{result.title}</h4>
                        <div className="cocktail-content">
                            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                                {result.snippet}
                            </pre>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // NEW: Render shooter/shot results
    const renderShooterResults = () => {
        console.log("Rendering shooter results:", results); // Debug log
        return (
            <div className="shooter-results">
                <h4 className="section-header">🥃 Shooter Recipes</h4>
                {results.map((result) => (
                    <div key={result.id} className="shooter-item" style={{ marginBottom: '20px' }}>
                        <h5>{result.title}</h5>
                        <div className="shooter-content" style={{ 
                            backgroundColor: '#fff3cd', 
                            padding: '15px', 
                            borderRadius: '8px', 
                            border: '1px solid #ffeaa7',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <pre style={{ 
                                whiteSpace: 'pre-wrap', 
                                fontFamily: 'inherit', 
                                margin: 0,
                                lineHeight: '1.5'
                            }}>
                                {result.snippet}
                            </pre>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Render mixed liquor results (cocktail + food pairing)
    const renderLiquorResults = () => {
        console.log("Rendering liquor results (cocktail + food):", results); // Debug log
        
        // Separate cocktail and food pairing results
        const cocktailResults = results.filter(result => 
            result.title.toLowerCase().includes('cocktail') || 
            result.title.toLowerCase().includes('recipe') ||
            result.snippet.toLowerCase().includes('ingredients:')
        );
        
        const foodResults = results.filter(result => 
            result.title.toLowerCase().includes('pairing') || 
            result.title.toLowerCase().includes('food') ||
            result.snippet.toLowerCase().includes('pairing notes:')
        );
        
        return (
            <div className="liquor-results">
                {/* Cocktail Recipe Section */}
                {cocktailResults.length > 0 && (
                    <div className="cocktail-section">
                        <h4 className="section-header">🍸 Cocktail Recipe</h4>
                        {cocktailResults.map((result) => (
                            <div key={result.id} className="cocktail-item">
                                <h5>{result.title}</h5>
                                <div className="cocktail-content">
                                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                                        {result.snippet}
                                    </pre>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Food Pairing Section */}
                {foodResults.length > 0 && (
                    <div className="food-pairing-section" style={{ marginTop: '20px' }}>
                        <h4 className="section-header">🍽️ Food Pairing</h4>
                        {foodResults.map((result) => (
                            <div key={result.id} className="pairing-item">
                                <h5>{result.title}</h5>
                                <div className="pairing-content" style={{ backgroundColor: '#f0f8f0', padding: '12px', borderRadius: '6px', border: '1px solid #d4edda' }}>
                                    {result.snippet}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Fallback - if categorization doesn't work, show all results */}
                {cocktailResults.length === 0 && foodResults.length === 0 && (
                    <div className="mixed-results">
                        {results.map((result, index) => (
                            <div key={result.id} className="mixed-item" style={{ marginBottom: '20px' }}>
                                <h5>{result.title}</h5>
                                <div className="mixed-content" style={{ 
                                    backgroundColor: index === 0 ? '#f8f9fa' : '#f0f8f0', 
                                    padding: '12px', 
                                    borderRadius: '6px', 
                                    border: `1px solid ${index === 0 ? '#e9ecef' : '#d4edda'}` 
                                }}>
                                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                                        {result.snippet}
                                    </pre>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Render generic results (fallback)
    const renderGenericResults = () => {
        console.log("Rendering generic results:", results); // Debug log
        return (
            <div className="generic-results">
                {results.map((result) => (
                    <div key={result.id} className="result-item">
                        <h4>{result.title}</h4>
                        {result.filePath && (
                            <p className="result-file-path">
                                Path: {result.filePath}
                            </p>
                        )}
                        <div className="result-content">
                            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                                {result.snippet}
                            </pre>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const searchType = getSearchType(searchQuery || '');
    
    // Debug logs
    console.log("ResultsPopup Debug:", {
        searchQuery,
        searchType,
        results,
        resultsLength: results?.length,
        formattedRecipe,
        error,
        visible
    });

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
                
                {/* Handle formattedRecipe display */}
                {formattedRecipe ? (
                    <>
                        <h3>{capitalizeTitle(formattedRecipe.title)}</h3>
                        <pre className="formatted-recipe-text" style={{ whiteSpace: 'pre-wrap', textAlign: 'left', color: '#333' }}> 
                            {formattedRecipe.recipe}
                        </pre>
                    </>
                ) : (
                    <>
                        {/* Show error if exists */}
                        {error && (
                            <>
                                <h3>Error</h3>
                                <p style={{ color: 'red' }}>{error}</p>
                                {results && results.length > 0 && <hr />}
                            </>
                        )}
                        
                        {/* Dynamic heading based on search type */}
                        <h3>
                            {results && results.length > 0 ? (
                                searchType === 'food' ? "Beverage Pairings" :
                                searchType === 'liquor' ? "Cocktail Recipe & Food Pairing" :
                                searchType === 'flavored_liquor' ? "Shooter Recipes" :
                                searchType === 'cocktail' ? "Recipe" :
                                "Search Results"
                            ) : "Search Results"}
                        </h3>
                        
                        {/* Render results or no results message */}
                        {results && results.length > 0 ? (
                            // Render based on search type
                            searchType === 'food' ? renderPairingResults() : 
                            searchType === 'liquor' ? renderLiquorResults() :
                            searchType === 'flavored_liquor' ? renderShooterResults() :
                            searchType === 'cocktail' ? renderCocktailResults() :
                            renderGenericResults()
                        ) : (
                            <div className="no-results-message">
                                {searchType === 'food' ? (
                                    <>
                                        <p>No beverage pairings found for "<strong>{capitalizeTitle(searchQuery)}</strong>".</p>
                                        <p>Try searching again to discover wine, spirit, and cocktail recommendations that complement {searchQuery}.</p>
                                    </>
                                ) : searchType === 'liquor' ? (
                                    <>
                                        <p>No cocktail recipes found for "<strong>{capitalizeTitle(searchQuery)}</strong>".</p>
                                        <p>Try searching again for a cocktail recipe featuring {searchQuery}.</p>
                                    </>
                                ) : searchType === 'flavored_liquor' ? (
                                    <>
                                        <p>No shooter recipes found for "<strong>{capitalizeTitle(searchQuery)}</strong>".</p>
                                        <p>Try searching again for shot recipes featuring {searchQuery}.</p>
                                    </>
                                ) : searchType === 'cocktail' ? (
                                    <>
                                        <p>No recipe found for "<strong>{capitalizeTitle(searchQuery)}</strong>".</p>
                                        <p>Please check the spelling or try searching for a different cocktail.</p>
                                    </>
                                ) : (
                                    <p>No results found for "<strong>{capitalizeTitle(searchQuery)}</strong>".</p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ResultsPopup;