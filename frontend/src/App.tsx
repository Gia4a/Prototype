// App.tsx - Updated with Speech-to-Cocktail Integration
import React, { useState, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import ResultsPopup from './components/ResultsPopup';
import Horoscope from './components/Horoscope';
import ButtonRow from './components/ButtonRow';
import CameraCapture from './components/CameraCapture';
import SpeechModal from './components/SpeechModal';
import type { CameraCaptureHandle } from './components/CameraCapture';
import './App.css';

// Initialize Firebase (replace with your actual config)
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Interface for conversation messages
interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

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

// Horoscope result interface
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
    const [showSpeechModal, setShowSpeechModal] = useState(false);
    
    // Speech conversation state
    const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
    const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
    
    // Camera ref at App level
    const cameraRef = useRef<CameraCaptureHandle>(null);

    // Process speech with Gemini via Firebase Function
    const processSpeechWithGemini = async (speechText: string) => {
        setIsProcessingSpeech(true);
        setIsLoading(true);
        setError(null);

        try {
            console.log('Processing speech:', speechText);
            
            // Get the callable function
            const getCocktailFromSpeech = httpsCallable(functions, 'getCocktailFromSpeech');
            
            // Call with speech text and conversation history
            const result = await getCocktailFromSpeech({
                speechText: speechText,
                conversationHistory: conversationHistory.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            });

            const data = result.data as any;
            console.log('Gemini response:', data);

            if (data.success) {
                // Add user message to history
                const userMessage: ConversationMessage = {
                    role: 'user',
                    content: speechText,
                    timestamp: new Date().toISOString()
                };

                // Add assistant response to history
                const assistantMessage: ConversationMessage = {
                    role: 'assistant',
                    content: data.response,
                    timestamp: data.timestamp || new Date().toISOString()
                };

                setConversationHistory(prev => [...prev, userMessage, assistantMessage]);

                // If there's a cocktail recommendation, display it
                if (data.cocktailRecommendation) {
                    const cocktail = data.cocktailRecommendation;
                    const cocktailResponse: MixologistResponse = {
                        originalQuery: speechText,
                        suggestion: data.response,
                        title: cocktail.name,
                        content: cocktail.description,
                        snippet: formatCocktailSnippet(cocktail),
                        searchType: 'speech',
                        why: 'Personalized recommendation from your bartender',
                        enhancedComment: {
                            poeticDescription: cocktail.description,
                            personalComment: data.response,
                            upgradeComment: undefined
                        }
                    };
                    
                    setRecipes({classic: cocktailResponse, elevate: null});
                    setCurrentRecipeType('classic');
                    setShowResults(true);
                } else {
                    // Just conversational response without specific cocktail
                    const conversationalResponse: MixologistResponse = {
                        originalQuery: speechText,
                        suggestion: data.response,
                        title: 'Bartender Says',
                        content: data.response,
                        searchType: 'speech',
                        why: 'Conversational response from your bartender'
                    };
                    
                    setRecipes({classic: conversationalResponse, elevate: null});
                    setCurrentRecipeType('classic');
                    setShowResults(true);
                }

            } else {
                throw new Error('Failed to get response from bartender');
            }

        } catch (err: any) {
            console.error('Error calling Firebase function:', err);
            const errorMessage = err.message || 'Failed to process your request. Please try again.';
            setError(errorMessage);
            handleError(errorMessage);
        } finally {
            setIsProcessingSpeech(false);
            setIsLoading(false);
        }
    };

    // Format cocktail recipe into snippet
    const formatCocktailSnippet = (cocktail: any): string => {
        let snippet = '';
        
        if (cocktail.ingredients && cocktail.ingredients.length > 0) {
            snippet += 'Ingredients: ' + cocktail.ingredients.join(', ') + '. ';
        }
        
        if (cocktail.instructions) {
            snippet += 'Instructions: ' + cocktail.instructions;
        }
        
        return snippet;
    };

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

    // Toggle speech modal visibility
    const toggleSpeechModal = () => {
        setShowSpeechModal(!showSpeechModal);
        // Clear conversation when closing modal
        if (showSpeechModal) {
            setConversationHistory([]);
        }
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

    // Handle speech result - UPDATED to use Firebase Function
    const handleSpeechResult = async (transcript: string) => {
        console.log('Speech recognized:', transcript);
        
        if (transcript.trim()) {
            try {
                await processSpeechWithGemini(transcript);
            } catch (err) {
                console.error('Error processing speech:', err);
            }
        }
    };

    return (
        <div className="app-container" style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden'
        }}>
            <div className="image-container" style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <img 
                    src="tips_thirst.png" 
                    alt="tips & thirst" 
                    className="main-background-image"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                    }}
                />
                
                {/* Button Row at bottom - fixed positioning */}
                <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1002
                }}>
                    <ButtonRow 
                        onHoroscopeClick={toggleHoroscopeGrid}
                        onCameraClick={toggleCamera}
                        onSpeechClick={toggleSpeechModal}
                        isLoading={isLoading || isProcessingSpeech}
                    />
                </div>
            </div>

            {/* Camera Modal */}
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
                            height: 'calc(100% - 60px)',
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

            {/* Horoscope Grid */}
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

            {/* Speech Modal - NOW INTEGRATED WITH FIREBASE */}
            <SpeechModal
                isOpen={showSpeechModal}
                onClose={() => setShowSpeechModal(false)}
                onSpeechResult={handleSpeechResult}
                onError={handleError}
            />

            {/* Loading Indicator */}
            {(isLoading || isProcessingSpeech) && (
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
                    <p>{isProcessingSpeech ? 'Talking to your bartender...' : 'Crafting your perfect cocktail...'}</p>
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