import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultsPopup from './components/ResultsPopup';
import HoroscopeGrid from './components/Horoscope';
import './App.css';

function App() {
    // State for mixologist suggestions from Cloud Function
    const [mixologistSuggestion, setMixologistSuggestion] = useState<string | null>(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentQuery, setCurrentQuery] = useState<string>("");

    // State for controlling the visibility of the zodiac sign grid
    const [isHoroscopeGridVisible, setIsHoroscopeGridVisible] = useState(false);

    const toggleHoroscopeGrid = () => {
        setIsHoroscopeGridVisible(!isHoroscopeGridVisible);
    };

    // This function will be passed down to SearchBar.tsx
    // SearchBar.tsx will call this when it gets a response from the Cloud Function
    const handleNewMixologistSuggestion = (suggestion: string, queryError: string | null) => {
        setMixologistSuggestion(suggestion);
        setError(queryError);
        setIsPopupVisible(true); // Open the popup when a new suggestion comes in
        setIsLoading(false); // Make sure loading is off
    };

    const closePopup = () => {
        setIsPopupVisible(false);
        setMixologistSuggestion(null); // Clear previous suggestion when closing
        setError(null); // Clear error too
    };

    const handleLoadingChange = (loadingState: boolean) => {
        setIsLoading(loadingState);
        if (loadingState) { 
            // Clear previous results when new search starts
            setMixologistSuggestion(null);
            setError(null);
            setIsPopupVisible(false);
        }
    };

    const handleErrorFromSearchBar = (errorMessage: string) => {
        setError(errorMessage);
        setMixologistSuggestion(null);
        setIsPopupVisible(true); // Show popup even for errors
        setIsLoading(false);
    };

    // Handle search query updates
    const handleSearchQuery = (query: string) => {
        setCurrentQuery(query);
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
    <SearchBar
        onNewSuggestion={handleNewMixologistSuggestion}
        onLoadingChange={handleLoadingChange}
        onError={handleErrorFromSearchBar}
        onQueryChange={handleSearchQuery}
        isLoading={isLoading}
    />
    {error && !isPopupVisible && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
</div>

{/* Separate positioning for Daily Horoscope Button */}
<div className="daily-horoscope-container">
    <button onClick={toggleHoroscopeGrid} className="daily-horoscope-button">
        {isHoroscopeGridVisible ? 'Daily Horoscope' : 'Daily Horoscope'}
    </button>
</div>

{/* Separate positioning for Zodiac Sign Grid */}
{isHoroscopeGridVisible && (
    <div className="horoscope-grid-container">
        <HoroscopeGrid onSignSelect={() => { /* No action needed for now */ }} />
    </div>
)}
                
                {error && !isPopupVisible && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
            {/* The ResultsPopup will only render if isPopupVisible is true */}
            {isPopupVisible && (
                <ResultsPopup
                    searchQuery={currentQuery}
                    isOpen={isPopupVisible}
                    onClose={closePopup}
                    suggestion={mixologistSuggestion}
                    error={error}
                />
            )}
        </div>
    </div>
);
}

export default App;