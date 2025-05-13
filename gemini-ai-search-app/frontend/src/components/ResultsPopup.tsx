// filepath: gemini-ai-search-app/frontend/src/components/ResultsPopup.tsx
import React from 'react';
import './ResultsPopup.css'; // We'll create this CSS file

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
    if (!visible) {
        return null;
    }

    return (
        <div className="results-popup-overlay">
            <div className="results-popup-content">
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