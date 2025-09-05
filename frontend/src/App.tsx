// App.tsx - Updated with Camera Modal at App level
import React, { useState, useRef } from 'react';
import SearchBar from './components/SearchBar';
import ResultsPopup from './components/ResultsPopup';
import Horoscope from './components/Horoscope';
import ButtonRow from './components/ButtonRow';
import CameraCapture from './components/CameraCapture';
import type { CameraCaptureHandle } from './components/CameraCapture';
import './App.css';

// Interface for mixologist response
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

// Add the missing HoroscopeResult interface
interface HoroscopeResult {
    cocktailName: string;
    theme: string;
    insight: string;
    ingredients?: string[];
    instructions?: string;
    sign?: string;
    moonPhase?: string;
    ruler?: string;
    element?: string;
    fourLineIdiom?: string;
}

const App: React.FC = () => {
    const [recipes, setRecipes] = useState<{classic: any, elevate: any}>({classic: null, elevate: null});
    const [currentRecipeType, setCurrentRecipeType] = useState<'classic' | 'elevate'>('classic');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [showHoroscope, setShowHoroscope] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    
    // Camera ref at App level
    const cameraRef = useRef<CameraCaptureHandle>(null);

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
        setShowHoroscope(!showHoroscope);
    };

    // Toggle camera visibility
    const toggleCamera = () => {
        if (showCamera && cameraRef.current) {
            cameraRef.current.stopCamera();
        }
        setShowCamera(!showCamera);
    };

    // Handle camera capture - moved to App level
    const handleCameraCapture = (imageData: string) => {
        if (cameraRef.current) {
            cameraRef.current.stopCamera();
        }
        setShowCamera(false);
        
        if (imageData) {
            // For now, treat camera capture as a general request
            // You can implement actual image analysis here
            handleNewSuggestion({
                originalQuery: "Camera captured image",
                suggestion: "Analyzing drink or food item from image...",
                title: "Image Analysis",
                searchType: "camera"
            });
        }
    };

    return (
        <div className="app-container">
            <div className="image-container">
                <img 
                    src="tips_thirst.png" 
                    alt="tips & thirst" 
                    className="main-background-image"
                />
                
                {/* Search Bar Container - Centered */}
                <div className="overlay-search">
                    <SearchBar
                        onNewSuggestion={handleNewSuggestion}
                        onLoadingChange={handleLoadingChange}
                        onError={handleError}
                        isLoading={isLoading}
                        showCamera={false} // Remove camera logic from SearchBar
                        onCameraToggle={() => {}} // Empty function since camera is handled at App level
                    />
                </div>

                {/* Button Row with Horoscope Star and Camera Eye */}
                <ButtonRow 
                    onHoroscopeClick={toggleHoroscopeGrid}
                    onCameraClick={toggleCamera}
                    isLoading={isLoading}
                />
            </div>

         {/* Camera Modal - Override universal-card-container positioning */}
            {showCamera && (
                <div
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 'min(380px, calc(100vw - 40px))',
                        height: 'min(600px, calc(100vh - 100px))',
                        background: 'rgba(20, 20, 30, 0.95)',
                        borderRadius: '12px',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        zIndex: 9999,
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)',
                        padding: '15px',
                        boxSizing: 'border-box',
                        // Override any CSS class positioning
                        bottom: 'unset !important',
                        right: 'unset !important',
                        margin: '0 !important',
                        maxWidth: 'min(400px, calc(100vw - 40px)) !important',
                        maxHeight: 'min(700px, calc(100vh - 100px)) !important'
                    }}
                    onClick={e => e.stopPropagation()}
                >
              
                    {/* Close button */}
                    <button
                        onClick={() => {
                            if (cameraRef.current) {
                                cameraRef.current.stopCamera();
                            }
                            setShowCamera(false);
                        }}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '50%',
                            color: '#fff',
                            fontSize: '18px',
                            width: '35px',
                            height: '35px',
                            cursor: 'pointer',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            backdropFilter: 'blur(5px)'
                        }}
                        aria-label="Close camera preview"
                    >
                        ×
                    </button>

                    {/* Camera container */}
                    <div
                        style={{
                            width: '100%',
                            height: 'calc(100% - 60px)', // Account for title and padding
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: 0,
                            border: 'none',
                            background: 'transparent',
                            borderRadius: 0
                        }}
                    >
                        <CameraCapture ref={cameraRef} onCapture={handleCameraCapture} />
                    </div>
                </div>
            )}
            
            {/* Backdrop overlay when camera is open */}
            {showCamera && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0, 0, 0, 0.6)',
                        zIndex: 9998,
                        backdropFilter: 'blur(2px)'
                    }}
                    onClick={() => {
                        if (cameraRef.current) {
                            cameraRef.current.stopCamera();
                        }
                        setShowCamera(false);
                    }}
                />
            )}

            {/* Horoscope Grid - Outside image-container */}
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
                />
            )}

            {/* Loading Indicator */}
            {isLoading && (
                <div className="loading-container" style={{ 
                    position: 'fixed', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    textAlign: 'center',
                    background: 'rgba(0, 0, 0, 0.8)',
                    padding: '20px',
                    borderRadius: '8px',
                    zIndex: 9999
                }}>
                    <div className="loading-spinner" />
                    <p>Crafting your perfect cocktail...</p>
                </div>
            )}

            {/* Results popup */}
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