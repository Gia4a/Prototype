import React, { useEffect } from 'react';
import './ResultsPopup.css';

interface ResultsPopupProps {
    // Props for Cloud Function mixologist
    isOpen: boolean;
    onClose: () => void;
    suggestion: string | null;
    error: string | null;
    
    // Props to maintain compatibility with your existing App.tsx
    searchQuery?: string;
    visible?: boolean; // Alternative to isOpen
}

const ResultsPopup: React.FC<ResultsPopupProps> = ({ 
    isOpen, 
    onClose, 
    suggestion, 
    error, 
    searchQuery,
    visible 
}) => {
    // Handle both isOpen and visible props
    const isVisible = isOpen || visible || false;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener('keydown', handleKeyDown);
        } else {
            document.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isVisible, onClose]);

    if (!isVisible) {
        return null;
    }

    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    // Function to capitalize first letter of each word for the title
    const capitalizeTitle = (title: string) => {
        return title.toLowerCase().split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Format the mixologist suggestion for better readability using your existing CSS classes
    const formatMixologistSuggestion = (text: string) => {
        // Split the text into logical sections
        const sections = text.split(/(?:\n\n|\n(?=[A-Z][^a-z]*:)|(?<=:)\s*\n)/).filter(section => section.trim());
        
        return sections.map((section, index) => {
            const trimmed = section.trim();
            if (!trimmed) return null;
            
            // Check if it's a header (ends with colon, contains common headers, or is short and uppercase-heavy)
            const isHeader = trimmed.endsWith(':') || 
                           /^(ingredients|instructions|recipe|pairing|notes|garnish|preparation|method):/i.test(trimmed) ||
                           (trimmed.length < 60 && trimmed.split(':').length > 1);
            
            if (isHeader) {
                return (
                    <div key={index} className="mixologist-section-header">
                        <h4>{trimmed}</h4>
                    </div>
                );
            }
            
            // Regular content - format as structured content like pairing items
            const lines = trimmed.split('\n').filter(line => line.trim());
            
            return (
                <div key={index} className="mixologist-content-section">
                    {lines.map((line, lineIndex) => {
                        const cleanLine = line.trim();
                        if (!cleanLine) return null;
                        
                        // Check if line looks like a list item (starts with -, *, number, or bullet)
                        if (/^[-*•]\s/.test(cleanLine) || /^\d+\.\s/.test(cleanLine)) {
                            return (
                                <div key={lineIndex} className="mixologist-list-item">
                                    {cleanLine}
                                </div>
                            );
                        }
                        
                        // Regular paragraph content
                        return (
                            <div key={lineIndex} className="mixologist-paragraph">
                                {cleanLine}
                            </div>
                        );
                    }).filter(Boolean)}
                </div>
            );
        }).filter(Boolean);
    };

    return (
        <div className="results-popup-overlay" onClick={handleOverlayClick}>
            <div className="results-popup-content">
                <button onClick={onClose} className="results-popup-close-button">
                    &times;
                </button>

                {/* Display the search query as a title if available */}
                {searchQuery && (
                    <h2 className="popup-main-title">
                        <strong>{capitalizeTitle(searchQuery)}</strong>
                    </h2>
                )}

                {/* Main content area */}
                <div className="popup-body">
                    {error ? (
                        <div className="error-section">
                            <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>
                                Something went wrong
                            </h3>
                            <p style={{ 
                                color: '#e74c3c', 
                                backgroundColor: '#fdf2f2', 
                                padding: '15px', 
                                borderRadius: '8px', 
                                border: '1px solid #fecaca',
                                margin: 0
                            }}>
                                {error}
                            </p>
                        </div>
                    ) : suggestion ? (
                        <div className="mixologist-results">
                            <div className="pairing-item mixologist-suggestion-container">
                                <h4 style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginTop: 0
                                }}>
                                    🍸 Mixologist's Suggestion
                                </h4>
                                <div className="pairing-content mixologist-content">
                                    {formatMixologistSuggestion(suggestion)}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-results-message">
                            <h3>Getting mixologist's suggestion...</h3>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                height: '60px',
                                marginTop: '20px'
                            }}>
                                <div className="loading-spinner" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultsPopup;