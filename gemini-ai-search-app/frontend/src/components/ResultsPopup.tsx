// filepath: gemini-ai-search-app/frontend/src/components/ResultsPopup.tsx
import React, { useEffect } from 'react'; // Removed useRef as it's not strictly needed for this approach
import './ResultsPopup.css';

export interface SearchResult {
    id: string;
    title: string;
    filePath?: string;
    snippet: string;
    // Add any other fields your Gemini API might return
}

interface ResultsPopupProps {
    results: SearchResult[];
    onClose: () => void;
    visible: boolean;
}

const ResultsPopup: React.FC<ResultsPopupProps> = ({ results, onClose, visible }) => {

    // Effect to handle 'Escape' key press for closing the popup
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

        // Cleanup function to remove the event listener
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [visible, onClose]); // Dependencies for the effect

    if (!visible) {
        return null;
    }

    // Handler for clicking on the overlay (background)
    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        // Check if the click was directly on the overlay and not on its children (the popup content)
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="results-popup-overlay" onClick={handleOverlayClick}>
            <div className="results-popup-content"> {/* This div prevents overlay click when clicking inside content */}
                <button onClick={onClose} className="results-popup-close-button">
                    &times;
                </button>
                <h2>Search Results</h2>
                {results.length === 0 ? (
                    <p>No results found.</p>
                ) : (
                    <ul>
                        {results.map((result) => (
                            <li key={result.id} className="result-item">
                                <h3>{result.title}</h3>
                                {result.filePath && (
                                    <p className="result-file-path">
                                        Path: {result.filePath}
                                    </p>
                                )}
                                <p className="result-snippet">{result.snippet}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ResultsPopup;