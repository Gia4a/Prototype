// filepath: gemini-ai-search-app/frontend/src/components/ResultsPopup.tsx
import React, { useEffect } from 'react';
import './ResultsPopup.css';

export interface SearchResult {
    id: string;
    title: string;
    filePath?: string;
    snippet: string;
}

interface ResultsPopupProps {
    searchQuery: string; // Add searchQuery prop
    results: SearchResult[];
    formattedRecipe?: string | null;
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
                        <h3>Recipe</h3> {/* Changed from h2 to h3 to be subordinate to the main title */}
                        <pre className="formatted-recipe-text" style={{ whiteSpace: 'pre-wrap', textAlign: 'left', color: '#333' }}> 
                            {formattedRecipe}
                        </pre>
                    </>
                ) : error ? (
                    <>
                        <h3>Error</h3> {/* Changed from h2 to h3 */}
                        <p style={{ color: 'red' }}>{error}</p>
                        {results && results.length > 0 && <hr />} 
                    </>
                ) : (
                    <>
                        <h3>Search Results</h3> {/* Changed from h2 to h3 */}
                        {results && results.length > 0 ? (
                            <ul>
                                {results.map((result) => (
                                    <li key={result.id} className="result-item">
                                        <h4>{result.title}</h4> {/* Changed from h3 to h4 */}
                                        {result.filePath && (
                                            <p className="result-file-path">
                                                Path: {result.filePath}
                                            </p>
                                        )}
                                        <p className="result-snippet">{result.snippet}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No results found for "<strong>{capitalizeTitle(searchQuery)}</strong>".</p>
                        )}
                    </>
                )}
                {error && !formattedRecipe && results && results.length > 0 && (
                     <>
                        <h3>Search Results (alongside error)</h3> {/* Changed from h2 to h3 */}
                        <ul>
                            {results.map((result) => (
                                <li key={result.id} className="result-item">
                                    <h4>{result.title}</h4> {/* Changed from h3 to h4 */}
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