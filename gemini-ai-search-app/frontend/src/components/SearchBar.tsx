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
            marginLeft: '8px',
            opacity: disabled ? 0.5 : 1,
            width: 32,
            height: 32
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
    const handleCameraCapture = (imageData: string) => {
        if (cameraRef.current) cameraRef.current.stopCamera();
        setShowCamera(false);
        if (imageData) {
            onSearch(imageData);
        }
    };
    const [query, setQuery] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const cameraRef = useRef<CameraCaptureHandle>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSearch(query);
    };
    return (
        <div style={{ marginBottom: '20px', marginLeft: '-20px', marginTop: '-5px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'inline-block', marginRight: '10px', position: 'relative', width: 390 }}>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Blind Pig Service..."
                    style={{
                        padding: '10px 40px 10px 10px',
                        width: '350px',
                        boxSizing: 'border-box',
                        position: 'relative',
                        zIndex: 1
                    }}
                    disabled={isLoading}
                    autoComplete="off"
                />
                <span style={{
                    position: 'absolute',
                    right: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    pointerEvents: isLoading ? 'none' : 'auto',
                    background: 'transparent',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <EyeIcon
                        onClick={() => {
                            setShowCamera(false); // reset first to ensure re-mount
                            setTimeout(() => setShowCamera(true), 0);
                        }}
                        disabled={isLoading}
                    />
                </span>
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