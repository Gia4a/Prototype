// filepath: gemini-ai-search-app/frontend/src/components/SearchBar.tsx
import React, { useState, useRef } from 'react';
import CameraCapture from './CameraCapture';
import type { CameraCaptureHandle } from './CameraCapture';

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

interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const cameraRef = useRef<CameraCaptureHandle>(null);

    const handleCameraCapture = (imageData: string) => {
        if (cameraRef.current) cameraRef.current.stopCamera();
        setShowCamera(false);
        if (imageData) {
            onSearch(imageData);
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSearch(query);
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
                    placeholder="Blind Pig Service..."
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