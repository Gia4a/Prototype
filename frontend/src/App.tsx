// App.tsx - Enhanced main component with upgrade functionality
import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultsPopup from './components/ResultsPopup';
import CocktailUpgradeService from './services/cocktailUpgradeService';
import type { UpgradeResponse, UpgradeType } from './services/cocktailUpgradeService';

// Initialize the upgrade service with your Gemini API key
const upgradeService = new CocktailUpgradeService(import.meta.env.VITE_GEMINI_API_KEY || '');

type MixologistResponse = UpgradeResponse;

const App: React.FC = () => {
    const [currentSuggestion, setCurrentSuggestion] = useState<MixologistResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [currentQuery, setCurrentQuery] = useState<string>('');

    // Handle new suggestions from search
    const handleNewSuggestion = (suggestion: MixologistResponse | string | null, query?: string) => {
        if (typeof suggestion === 'string') {
            // Convert string to proper response object
            setCurrentSuggestion({
                originalQuery: query || '',
                suggestion: suggestion,
                title: 'Mixologist Recommendation',
                searchType: 'general'
            });
        } else {
            setCurrentSuggestion(suggestion);
        }
        
        if (query) {
            setCurrentQuery(query);
        }
        
        setError(null);
        setShowResults(true);
    };

    // Handle upgrade requests using the client-side service
    const handleUpgradeRequest = async (originalQuery: string, upgradeType: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // Accept string for compatibility, but cast to UpgradeType
            const safeUpgradeType = upgradeType as UpgradeType;
            console.log('Processing upgrade request:', originalQuery, safeUpgradeType);

            // Use the client-side upgrade service instead of Firebase Cloud Functions
            const responseData = await upgradeService.getUpgradedCocktail(originalQuery, safeUpgradeType);

            console.log('Upgrade response:', responseData);

            // Update the current suggestion with the upgrade
            setCurrentSuggestion(responseData);
            setCurrentQuery(originalQuery); // Keep original query for context

        } catch (error) {
            if (error instanceof Error) {
                console.error("Error processing upgrade:", error.message);
                setError(`Sorry, couldn't generate the ${upgradeType} upgrade. Please try again.`);
            } else {
                console.error("Error processing upgrade:", error);
                setError('Sorry, an unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
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
        setCurrentSuggestion(null);
        setError(null);
    };

    return (
        <div className="app-container">
            {/* Main search interface */}
            <div className="main-content">
                <SearchBar
                    onNewSuggestion={handleNewSuggestion}
                    onLoadingChange={handleLoadingChange}
                    onError={handleError}
                    isLoading={isLoading}
                    onUpgradeRequest={handleUpgradeRequest}
                />
                
                {/* Loading indicator */}
                {isLoading && (
                    <div className="loading-indicator">
                        <div className="loading-spinner"></div>
                        <p>Crafting your perfect cocktail...</p>
                    </div>
                )}
            </div>

            {/* Results popup with enhanced features */}
            <ResultsPopup
                isOpen={showResults}
                onClose={handleCloseResults}
                suggestion={currentSuggestion}
                error={error}
                searchQuery={currentQuery}
                visible={showResults}
                onUpgradeRequest={handleUpgradeRequest}
            />
        </div>
    );
};

export default App;