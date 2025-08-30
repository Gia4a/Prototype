// App.tsx - Reverted to single-suggestion state, with Horoscope and upgrade logic preserved
import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultsPopup from './components/ResultsPopup';
import Horoscope from './components/Horoscope';
import CocktailUpgradeService from './services/cocktailUpgradeService';
import type { UpgradeResponse, UpgradeType } from './services/cocktailUpgradeService';
import './App.css';

const upgradeService = new CocktailUpgradeService(import.meta.env.VITE_GEMINI_API_KEY || '');
type MixologistResponse = UpgradeResponse;

const App: React.FC = () => {
    const [currentSuggestion, setCurrentSuggestion] = useState<MixologistResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [currentQuery, setCurrentQuery] = useState<string>('');
    const [showHoroscope, setShowHoroscope] = useState(false);

    // Handle new suggestions from search
    const handleNewSuggestion = (suggestion: MixologistResponse | string | null, query?: string) => {
        if (typeof suggestion === 'string') {
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
            const safeUpgradeType = upgradeType as UpgradeType;
            const responseData = await upgradeService.getUpgradedCocktail(originalQuery, safeUpgradeType);
            setCurrentSuggestion(responseData);
            setCurrentQuery(originalQuery);
        } catch (error) {
            if (error instanceof Error) {
                setError(`Sorry, couldn't generate the ${upgradeType} upgrade. Please try again.`);
            } else {
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

                {/* Horoscope Button */}
                <button
                    style={{
                        margin: '16px auto',
                        display: 'block',
                        background: 'linear-gradient(90deg, #6366f1, #a21caf)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 32px',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                    }}
                    onClick={() => setShowHoroscope(true)}
                >
                    🔮 Horoscope Cocktails
                </button>

                {/* Loading indicator */}
                {isLoading && (
                    <div className="loading-indicator">
                        <div className="loading-spinner"></div>
                        <p>Crafting your perfect cocktail...</p>
                    </div>
                )}
            </div>

            {/* Horoscope Modal */}
            {showHoroscope && (
                <div className="horoscope-modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.7)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#18181b',
                        borderRadius: '16px',
                        padding: '32px 24px',
                        minWidth: 340,
                        maxWidth: 600,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowHoroscope(false)}
                            style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                fontSize: 28,
                                cursor: 'pointer',
                                zIndex: 2
                            }}
                            aria-label="Close horoscope"
                        >
                            ×
                        </button>
                        <Horoscope
                            onSignSelect={(sign, result) => {
                                setShowHoroscope(false);
                                setCurrentSuggestion({
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
                                });
                                setError(null);
                                setShowResults(true);
                            }}
                            onLoadingChange={handleLoadingChange}
                            onError={handleError}
                        />
                    </div>
                </div>
            )}

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