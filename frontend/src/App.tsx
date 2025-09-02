// App.tsx - Updated with properly positioned daily horoscope button
import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultsPopup from './components/ResultsPopup';
import Horoscope from './components/Horoscope';
import type { HoroscopeResult } from './components/Horoscope';
import './App.css';

// Interface for mixologist response (simplified without upgrade service dependency)
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
    enhancedComment?: {
        poeticDescription?: string;
        personalComment?: string;
        upgradeComment?: string;
    };
}

const App: React.FC = () => {
    const [recipes, setRecipes] = useState<{classic: any, elevate: any}>({classic: null, elevate: null});
    const [currentRecipeType, setCurrentRecipeType] = useState<'classic' | 'elevate'>('classic');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [showHoroscope, setShowHoroscope] = useState(false);

    // Handle new suggestions from search
    const handleNewSuggestion = (suggestion: MixologistResponse | string | null, query?: string) => {
        if (typeof suggestion === 'string') {
            const structuredData: MixologistResponse = {
                originalQuery: query || '',
                suggestion: suggestion,
                title: 'Mixologist Recommendation',
                searchType: 'general'
            };
            setRecipes({classic: structuredData, elevate: null});
        } else if (suggestion) {
            // If backend returns results array, split into classic and elevate
            if (suggestion.results && Array.isArray(suggestion.results) && suggestion.results.length >= 2) {
                setRecipes({
                    classic: suggestion.results[0],
                    elevate: suggestion.results[1]
                });
            } else {
                setRecipes({classic: suggestion, elevate: null});
            }
        } else {
            setRecipes({classic: null, elevate: null});
        }
        
        setCurrentRecipeType('classic');
        setError(null);
        setShowResults(true);
    };

    // Handle loading state changes
    const handleLoadingChange = (loading: boolean) => {
        setIsLoading(loading);
    };

    // Handle errors
    const handleError = (errorMessage: string) => {
        setError(errorMessage);
        setIsLoading(false);
    };

    // Close results popup
    const handleCloseResults = () => {
        setShowResults(false);
        setRecipes({classic: null, elevate: null});
        setCurrentRecipeType('classic');
        setError(null);
    };

    // Handle upgrade toggle
    const handleUpgradeToggle = () => {
        setCurrentRecipeType(currentRecipeType === 'classic' ? 'elevate' : 'classic');
    };

    // Toggle horoscope grid visibility
    const toggleHoroscopeGrid = () => {
        console.log('Toggling horoscope grid. Current state:', showHoroscope);
        setShowHoroscope(!showHoroscope);
    };

    // Close horoscope grid
    const closeHoroscopeGrid = () => {
        console.log('Closing horoscope grid');
        setShowHoroscope(false);
    };

    console.log('App render - showHoroscope:', showHoroscope);

    return (
        <div className="app-container">
            <div className="image-container">
                <img 
                    src="/Bar_pig.png" 
                    alt="Blind Pig Bar" 
                    className="main-background-image"
                />
        
                <div className="overlay-search">
                    <SearchBar
                        onNewSuggestion={handleNewSuggestion}
                        onLoadingChange={handleLoadingChange}
                        onError={handleError}
                        isLoading={isLoading}
                    />
                </div>
                
                {/* Horoscope Button */}
                <button
                    onClick={toggleHoroscopeGrid}
                    className="daily-horoscope-button"
                    aria-label="Open Astro Cocktails"
                >
                    Astro Cocktails
                </button>

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="loading-container">
                        <div className="loading-spinner" />
                        <p>Crafting your perfect cocktail...</p>
                    </div>
                )}
            </div>

            {/* Horoscope Grid - MOVED OUTSIDE image-container with close handler */}
            {showHoroscope && (
                <Horoscope 
                    onSignSelect={(sign, result: HoroscopeResult) => {
                        setShowHoroscope(false);
                        const horoscopeData: MixologistResponse = {
                            originalQuery: sign.name,
                            suggestion: result.cocktailName,
                            title: result.cocktailName,
                            content: result.theme,
                            why: result.insight,
                            enhancedComment: {
                                poeticDescription: result.theme,
                                personalComment: result.insight,
                                upgradeComment: undefined
                            },
                            ...result
                        };
                        setRecipes({classic: horoscopeData, elevate: null});
                        setCurrentRecipeType('classic');
                        setError(null);
                        setShowResults(true);
                    }}
                    onLoadingChange={handleLoadingChange}
                    onError={handleError}
                    onClose={closeHoroscopeGrid}
                />
            )}

            {/* Results popup with enhanced features */}
            <ResultsPopup
                isOpen={showResults}
                onClose={handleCloseResults}
                recipes={recipes}
                currentRecipeType={currentRecipeType}
                error={error}
                visible={showResults}
                onUpgradeRequest={handleUpgradeToggle}
            />
        </div>
    );
};

export default App;