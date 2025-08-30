import React, { useState, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import CameraCapture from './CameraCapture';
import type { CameraCaptureHandle } from './CameraCapture';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Eye icon component
const EyeIcon = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
    <span
        onClick={disabled ? undefined : onClick}
        style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            width: 28,
            height: 28
        }}
    >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="12" rx="10" ry="6" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
    </span>
);

// Interfaces
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

interface SearchBarProps {
    onNewSuggestion: (suggestion: MixologistResponse | string | null, query?: string) => void;
    onLoadingChange: (loading: boolean) => void;
    onError: (error: string) => void;
    isLoading: boolean;
    onUpgradeRequest?: (originalQuery: string, upgradeType: string) => void; // New prop for upgrades
}

const SearchBar: React.FC<SearchBarProps> = ({ 
    onNewSuggestion, 
    onLoadingChange, 
    onError, 
    isLoading 
}) => {
    const [query, setQuery] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const cameraRef = useRef<CameraCaptureHandle>(null);

    // Call the mixologist Cloud Function
    const callMixologist = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            onError('Please enter a search term');
            return;
        }

        onLoadingChange(true);
        
        try {
            console.log('Calling mixologist with query:', searchQuery);
            
            const getMixologistSuggestion = httpsCallable<
                { query: string },
                MixologistResponse
            >(functions, 'getMixologistSuggestion');

            const result = await getMixologistSuggestion({ query: searchQuery.trim() });
            const responseData = result.data;

            console.log('Mixologist response:', responseData);

            // Always pass the response, even if it's an error type
            onNewSuggestion(responseData, searchQuery);
            
        } catch (error: any) {
            console.error("Error calling mixologist function:", error);
            
            // Create a fallback response for display
            const fallbackResponse: MixologistResponse = {
                originalQuery: searchQuery,
                suggestion: `Sorry, I couldn't process your request for "${searchQuery}". Please try again.`,
                title: 'Search Error',
                searchType: 'error'
            };
            
            onNewSuggestion(fallbackResponse, searchQuery);
        } finally {
            onLoadingChange(false);
        }
    };

    const handleCameraCapture = (imageData: string) => {
        if (cameraRef.current) cameraRef.current.stopCamera();
        setShowCamera(false);
        if (imageData) {
            // For now, treat camera capture as a general request
            callMixologist("Analyze this drink or food item from image");
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (query.trim()) {
            callMixologist(query);
        }
    };

    const handleCameraClick = () => {
        if (!isLoading) {
            setShowCamera(false);
            setTimeout(() => setShowCamera(true), 0);
        }
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            <form onSubmit={handleSubmit} style={{ 
                display: 'inline-block', 
                position: 'relative', 
                width: 'clamp(280px, 70vw, 390px)',
                maxWidth: 'calc(100vw - 80px)'
            }}>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Ask the Mixologist (e.g., Pho, vodka, Old Fashioned recipe)"
                    style={{
                        padding: 'clamp(8px, 2vw, 10px) clamp(40px, 12vw, 50px) clamp(8px, 2vw, 10px) clamp(8px, 2vw, 10px)',
                        width: '100%',
                        boxSizing: 'border-box',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: 'clamp(14px, 4vw, 16px)'
                    }}
                    disabled={isLoading}
                    autoComplete="off"
                />
                <div style={{
                    position: 'absolute',
                    right: 'clamp(8px, 2vw, 10px)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <EyeIcon onClick={handleCameraClick} disabled={isLoading} />
                </div>
            </form>

            {/* Camera Modal */}
            {showCamera && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onClick={() => {
                        if (cameraRef.current) cameraRef.current.stopCamera();
                        setShowCamera(false);
                    }}
                >
                    <div
                        style={{
                            background: '#222',
                            padding: 24,
                            borderRadius: 12,
                            boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
                            position: 'relative',
                            minWidth: 320,
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => {
                                if (cameraRef.current) cameraRef.current.stopCamera();
                                setShowCamera(false);
                            }}
                            style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                fontSize: 24,
                                cursor: 'pointer',
                                zIndex: 2
                            }}
                            aria-label="Close camera preview"
                        >
                            ×
                        </button>
                        <CameraCapture ref={cameraRef} onCapture={handleCameraCapture} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;