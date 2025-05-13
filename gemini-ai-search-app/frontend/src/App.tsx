import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultsPopup from './components/ResultsPopup';
import type { SearchResult } from './components/ResultsPopup';
import { fetchSearchResultsFromBackend } from './services/searchService';
import './App.css'; // Main app styles

function App() {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setResults([]);
            setIsPopupVisible(false);
            setError(null);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const searchData = await fetchSearchResultsFromBackend(query);
            setResults(searchData);
            setIsPopupVisible(true);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch results. Is the backend running?');
            setResults([]);
            setIsPopupVisible(false); // Or keep it visible to show the error
        } finally {
            setIsLoading(false);
        }
    };

    const closePopup = () => {
        setIsPopupVisible(false);
        // Optionally clear results and error when closing
        // setResults([]);
        // setError(null);
    };

    return (
        <div className="app-container">
            <h1>Gemini AI Search</h1>
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            {error && <p className="error-message">{error}</p>}
            <ResultsPopup
                results={results}
                onClose={closePopup}
                visible={isPopupVisible}
            />
        </div>
    );
}

export default App;
