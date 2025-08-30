import { useState } from 'react';
import SearchBar from './components/SearchBar';
import Horoscope from './components/Horoscope';
import ResultsPopup from './components/ResultsPopup';
import './App.css';

// Interfaces for type safety
interface AstrologySign {
    name: string;
    displayName: string;
}

interface HoroscopeResult {
    sign: string;
    cocktailName: string;
    moonPhase: string;
    ruler: string;
    element: string;
    ingredients: string[];
    instructions: string;
    theme: string;
    insight: string;
}

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

// Union type for all possible popup content
type PopupContent = HoroscopeResult | MixologistResponse | null;

function App() {
    // State management
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isHoroscopeGridVisible, setIsHoroscopeGridVisible] = useState(false);
    const [popupContent, setPopupContent] = useState<PopupContent>(null);
    const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

    // Toggle horoscope grid visibility
    const toggleHoroscopeGrid = () => {
        setIsHoroscopeGridVisible(!isHoroscopeGridVisible);
    };

    // Handle mixologist search results
    const handleMixologistSuggestion = (data: MixologistResponse | string | null, queryFromSearchBar?: string) => {
        console.log("Received mixologist data:", data);
        
        if (data) {
            if (typeof data === 'string') {
                // Convert string response to structured format
                const structuredData: MixologistResponse = {
                    originalQuery: queryFromSearchBar || 'Unknown Query',
                    suggestion: data,
                    title: 'Mixologist Recommendation',
                    searchType: 'general'
                };
                setPopupContent(structuredData);
            } else {
                // Use the structured response directly
                setPopupContent(data);
            }
        } else {
            setPopupContent(null);
        }
        
        setSearchQuery(queryFromSearchBar);
        setError(null);
        setIsPopupVisible(true);
        setIsLoading(false);
    };

    // Handle horoscope sign selection
    const handleSignSelect = (sign: AstrologySign, result: HoroscopeResult) => {
        console.log("Received horoscope result:", result);
        
        setPopupContent(result);
        setSearchQuery(`${sign.displayName} Cosmic Cocktail`);
        setError(null);
        setIsPopupVisible(true);
    };

    // Handle loading state changes
    const handleLoadingChange = (loadingState: boolean) => {
        setIsLoading(loadingState);
        if (loadingState) {
            // Clear previous results when starting new search
            setError(null);
            setPopupContent(null);
            setIsPopupVisible(false);
        }
    };

    // Handle errors from various components
    const handleError = (errorMessage: string) => {
        console.error("Application error:", errorMessage);
        setError(errorMessage);
        setPopupContent(null);
        setIsPopupVisible(true);
        setIsLoading(false);
    };

    // Close popup and reset state
    const closePopup = () => {
        setIsPopupVisible(false);
        setError(null);
        setPopupContent(null);
        setSearchQuery(undefined);
    };

    return (
        <div className="app-container">
            <div className="image-container">
                <img 
                    src="/Bar_pig.png" 
                    alt="Blind Pig Bar" 
                    className="main-background-image"
                />
                
                {/* Search Bar Overlay */}
                <div className="overlay-search">
                    <SearchBar
                        onNewSuggestion={handleMixologistSuggestion}
                        onLoadingChange={handleLoadingChange}
                        onError={handleError}
                        isLoading={isLoading}
                    />
                </div>

                {/* Daily Horoscope Button */}
                <div className="daily-horoscope-container">
                    <button onClick={toggleHoroscopeGrid} className="daily-horoscope-button">
                        {isHoroscopeGridVisible ? 'Hide Horoscope' : 'Daily Horoscope'}
                    </button>
                </div>

                {/* Horoscope Grid */}
                {isHoroscopeGridVisible && (
                    <Horoscope 
                        onSignSelect={handleSignSelect}
                        onLoadingChange={handleLoadingChange}
                        onError={handleError}
                    />
                )}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="loading-container" style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        textAlign: 'center',
                        background: 'rgba(0, 0, 0, 0.8)',
                        padding: '20px',
                        borderRadius: '8px'
                    }}>
                        <div className="loading-spinner" />
                        <p>Getting mixologist's suggestion...</p>
                    </div>
                )}

                {/* Results Popup */}
                <ResultsPopup
                    isOpen={isPopupVisible}
                    onClose={closePopup}
                    suggestion={popupContent}
                    error={error}
                    searchQuery={searchQuery}
                    visible={isPopupVisible}
                />
            </div>
        </div>
    );
}

export default App;