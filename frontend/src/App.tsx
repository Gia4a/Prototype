import { useState } from 'react';
import SearchBar from './components/SearchBar';
import Horoscope from './components/Horoscope';
import ResultsPopup from './components/ResultsPopup';
import './App.css';

// Updated types for selectedSign
interface AstrologySign {
  name: string;
  displayName: string;
}

// Add the HoroscopeSuggestion interface (should match ResultsPopup)
interface HoroscopeSuggestion {
    sign: string;
    cocktailName: string;
    moonPhase: string;
    ruler: string;
    element: string;
    base: string;
    mixer: string;
    citrus: string;
    instructions: string[];
    theme: string;
    insight: string;
}

function App() {
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for controlling the visibility of the zodiac sign grid
    const [isHoroscopeGridVisible, setIsHoroscopeGridVisible] = useState(false);

    // Updated state to handle both string and HoroscopeSuggestion
    const [apiResult, setApiResult] = useState<HoroscopeSuggestion | string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

    const toggleHoroscopeGrid = () => {
        setIsHoroscopeGridVisible(!isHoroscopeGridVisible);
    };

    // Function to parse string results into HoroscopeSuggestion format
    const parseStringToHoroscope = (result: string, query?: string): HoroscopeSuggestion | null => {
        try {
            // If the result is already a JSON string, parse it
            const parsed = JSON.parse(result);
            if (parsed.sign && parsed.cocktailName) {
                return parsed as HoroscopeSuggestion;
            }
        } catch (e) {
            // If parsing fails, create a basic structure from the string
            console.warn('Could not parse horoscope data, creating fallback structure');
        }
        
        // Fallback: create a basic horoscope structure from string result
        return {
            sign: query?.includes('Cosmic Cocktail') ? query.replace(' Cosmic Cocktail', '') : 'Unknown',
            cocktailName: query || 'Mixologist Special',
            moonPhase: 'current phase',
            ruler: 'Mercury',
            element: 'Unknown',
            base: 'Spirits',
            mixer: 'Mixers',
            citrus: 'Garnish',
            instructions: [result || 'No instructions available'],
            theme: 'Mixologist recommendation',
            insight: result || 'No insight available'
        };
    };

    // This function will be called by SearchBar.tsx when it gets a response
    const handleNewMixologistSuggestion = (suggestion: string | null, query?: string) => {
        if (suggestion) {
            // Try to parse as horoscope data, or convert string to horoscope format
            const horoscopeData = parseStringToHoroscope(suggestion, query);
            setApiResult(horoscopeData);
        } else {
            setApiResult(null);
        }
        setSearchQuery(query);
        setError(null);
        setIsPopupVisible(true);
        setIsLoading(false);
    };

    const closePopup = () => {
        setIsPopupVisible(false);
        setError(null);
        setApiResult(null);
        setSearchQuery(undefined);
    };

    const handleLoadingChange = (loadingState: boolean) => {
        setIsLoading(loadingState);
        if (loadingState) { 
            // Clear previous results when new search starts
            setError(null);
            setApiResult(null);
            setIsPopupVisible(false);
        }
    };

    const handleErrorFromSearchBar = (errorMessage: string) => {
        setError(errorMessage);
        setApiResult(null);
        setIsPopupVisible(true);
        setIsLoading(false);
    };

    // Function to handle sign selection from Horoscope
    const handleSignSelect = (sign: AstrologySign, result: string) => {
        try {
            // Try to parse the result as JSON first
            const parsedResult = JSON.parse(result);
            setApiResult(parsedResult as HoroscopeSuggestion);
        } catch (e) {
            // If parsing fails, use the parseStringToHoroscope function
            const horoscopeData = parseStringToHoroscope(result, `${sign.displayName} Cosmic Cocktail`);
            setApiResult(horoscopeData);
        }
        
        setSearchQuery(`${sign.displayName} Cosmic Cocktail`);
        setError(null);
        setIsPopupVisible(true);
    };

    // Function to handle horoscope loading states
    const handleHoroscopeLoadingChange = (loading: boolean) => {
        setIsLoading(loading);
    };

    // Function to handle horoscope errors
    const handleHoroscopeError = (errorMessage: string) => {
        setError(errorMessage);
    };

    // Ensure we pass the right type to ResultsPopup
    const horoscopeSuggestion: HoroscopeSuggestion | null = 
        typeof apiResult === 'object' && apiResult !== null ? apiResult : null;

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
                        isLoading={isLoading}
                    />
                </div>

                {/* Separate positioning for Daily Horoscope Button */}
                <div className="daily-horoscope-container">
                    <button onClick={toggleHoroscopeGrid} className="daily-horoscope-button">
                        {isHoroscopeGridVisible ? 'Hide Horoscope' : 'Daily Horoscope'}
                    </button>
                </div>

                {/* Render Horoscope component when grid is visible */}
                {isHoroscopeGridVisible && (
                    <div className="horoscope-grid-container">
                        <Horoscope 
                            onSignSelect={handleSignSelect}
                            onLoadingChange={handleHoroscopeLoadingChange}
                            onError={handleHoroscopeError}
                        />
                    </div>
                )}

                {/* Show loading spinner when processing */}
                {isLoading && (
                    <div className="loading-container" style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <div className="loading-spinner" />
                        <p>Getting mixologist's suggestion...</p>
                    </div>
                )}

                {/* ResultsPopup component */}
                <ResultsPopup
                    isOpen={isPopupVisible}
                    onClose={closePopup}
                    suggestion={horoscopeSuggestion}
                    error={error}
                    searchQuery={searchQuery}
                    visible={isPopupVisible}
                />
            </div>
        </div>
    );
}

export default App;