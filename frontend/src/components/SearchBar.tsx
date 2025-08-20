import React, { useState, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import CameraCapture from './CameraCapture';
import type { CameraCaptureHandle } from './CameraCapture';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, // Should be blind-pig-bar.firebaseapp.com
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,   // Should be blind-pig-bar
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, // Should be blind-pig-bar.appspot.com
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    // Add others if needed: messagingSenderId, measurementId
};


// Initialize Firebase App once outside the component to avoid re-initialization
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// All-seeing eye SVG icon
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

// Define the props that SearchBar will receive from App.tsx
interface SearchBarProps {
    // Cloud Function props
    onNewSuggestion: (suggestion: string, error: string | null) => void;
    onLoadingChange: (isLoading: boolean) => void;
    onError: (errorMessage: string) => void;
    onQueryChange?: (query: string) => void;
    isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
    onNewSuggestion, 
    onLoadingChange, 
    onError, 
    onQueryChange,
    isLoading 
}) => {
    const [query, setQuery] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const cameraRef = useRef<CameraCaptureHandle>(null);

    // Handle Cloud Function mixologist request
    const callMixologist = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            onError("Please enter something to ask the mixologist!");
            return;
        }

        onLoadingChange(true); // Notify App.tsx that loading has started
        
        // Update query in parent component for popup title
        if (onQueryChange) {
            onQueryChange(searchQuery.trim());
        }

        try {
            const callMixologistFunction = httpsCallable(functions, 'getMixologistSuggestion');
            const result = await callMixologistFunction({ query: searchQuery.trim() });

            const suggestion = (result.data as any).mixologistSuggestion;
            const originalQuery = (result.data as any).originalQuery;
            const generatedPrompt = (result.data as any).generatedPrompt;

            // Pass the result back up to App.tsx
            onNewSuggestion(suggestion, null);
            console.log("Full Cloud Function Response:", { originalQuery, generatedPrompt, suggestion });

        } catch (err: any) {
            console.error("Error calling mixologist function:", err);
            const errorMessage = `Error: ${err.message || 'Couldn\'t get a suggestion from the mixologist.'}`;
            onError(errorMessage);
            onNewSuggestion("", errorMessage);
        } finally {
            onLoadingChange(false); // Notify App.tsx that loading has finished
        }
    };

    const handleCameraCapture = (imageData: string) => {
        if (cameraRef.current) cameraRef.current.stopCamera();
        setShowCamera(false);
        if (imageData) {
            // For camera captures, you might want to handle differently
            // For now, treating it as a text query - you may need to modify this
            callMixologist("Image captured - please analyze this drink/food item");
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        callMixologist(query);
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            <form onSubmit={handleSubmit} style={{ 
                display: 'inline-block', 
                position: 'relative', 
                width: 'clamp(280px, 70vw, 390px)',
                maxWidth: 'calc(100vw - 80px)' // Leave space for logo on mobile
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
                    pointerEvents: isLoading ? 'none' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <EyeIcon
                        onClick={() => {
                            setShowCamera(false); // reset first to ensure re-mount
                            setTimeout(() => setShowCamera(true), 0);
                        }}
                        disabled={isLoading}
                    />
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