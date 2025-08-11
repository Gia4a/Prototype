import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultsPopup from './components/ResultsPopup';
import type { SearchResult } from './components/ResultsPopup';
import { fetchSearchResultsFromBackend } from './services/searchService';
import type { BackendResponse } from './services/searchService';

import './App.css';

function App() {
    const [results, setResults] = useState<SearchResult[]>([]);
    // Use 'any' or define BestRecipe type locally if needed, otherwise use the correct type from the backend response
    const [formattedRecipe, setFormattedRecipe] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [currentQuery, setCurrentQuery] = useState<string>(""); // Add state for the current query

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setResults([]);
            setFormattedRecipe(null);
            setIsPopupVisible(false);
            setError(null);
            setCurrentQuery(""); // Clear current query
            return;
        }
        setIsLoading(true);
        setError(null);
        setFormattedRecipe(null);
        setCurrentQuery(query); // Set the current query

        try {
            const backendResponse: BackendResponse = await fetchSearchResultsFromBackend(query);
            setResults(backendResponse.results || []);
            setFormattedRecipe(backendResponse.formattedRecipe ?? null);
            setIsPopupVisible(true);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch results. Is the backend running?');
            setResults([]);
            setFormattedRecipe(null);
            setIsPopupVisible(true);
        } finally {
            setIsLoading(false);
        }
    };

    const closePopup = () => {
        setIsPopupVisible(false);
        // Optionally clear currentQuery when closing if you want the title gone next time
        // setCurrentQuery(""); 
    };

    return (
        <div className="app-container">
            {/* Image container with overlaid search elements */}
            <div className="image-container">
                <img 
                    src="/Bar_pig.png" 
                    alt="Blind Pig Bar" 
                    className="main-background-image"
                />
                
                {/* Search bar positioned over the image */}
                <div className="overlay-search">
                    <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                    {error && !isPopupVisible && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
                </div>
            </div>
            
            <ResultsPopup
                searchQuery={currentQuery}
                results={results}
                formattedRecipe={formattedRecipe}
                error={error && isPopupVisible ? error : null}
                onClose={closePopup}
                visible={isPopupVisible}
            />
        </div>
    );
}

export default App;