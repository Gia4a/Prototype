import React, { useEffect } from 'react';
import './ResultsPopup.css';
import CompactHoroscopeCard from './CompactHoroscopeCard';
import type { HoroscopeData } from './CompactHoroscopeCard';

interface ResultsPopupProps {
    isOpen: boolean;
    onClose: () => void;
    suggestion: any; // Accept any type
    error: string | null;
    searchQuery?: string;
    visible?: boolean;
}

const ResultsPopup: React.FC<ResultsPopupProps> = ({ 
    isOpen, 
    onClose, 
    suggestion, 
    error, 
    searchQuery,
    visible 
}) => {
    const isVisible = isOpen || visible || false;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener('keydown', handleKeyDown);
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

    // Create proper data format for CompactHoroscopeCard
    const createCompactData = (rawData: any, query?: string): HoroscopeData => {
        console.log('Raw suggestion data:', rawData);
        // Update search query to use cocktail name instead of sign
        console.log('Search query:', rawData.cocktailName || query);

        if (!rawData) {
            return {
                sign: 'Mixologist',
                cocktailName: 'Special Recommendation',
                moonPhase: 'current phase',
                ruler: 'Mercury',
                element: 'Spirit',
                ingredients: ['Premium Spirits', 'Quality Mixers', 'Fresh Garnish'],
                instructions: 'Mix according to preferences',
                theme: 'Professional recommendation',
                insight: 'No recommendation available at this time.'
            };
        }

        // Ensure insight is limited to 2 sentences max for compact display
        let insight = rawData.insight || 'A carefully crafted cocktail recommendation.';
        if (insight) {
            const sentences = insight.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s+/).filter((s: string) => s.trim().length > 0);
            insight = sentences.slice(0, 2).join(' ').trim();
        }

        // Create proper ingredients array from raw data
        const ingredients = rawData.ingredients || ['Premium Spirits', 'Quality Mixers', 'Fresh Garnish'];

        // Update header to use cocktail name directly
        const header = rawData.cocktailName || 'Special Recommendation';

        return {
            sign: rawData.sign || 'Mixologist',
            cocktailName: header,
            moonPhase: rawData.moonPhase || 'current phase',
            ruler: rawData.ruler || 'Mercury',
            element: rawData.element || 'Spirit',
            ingredients,
            instructions: Array.isArray(rawData.instructions) 
                ? rawData.instructions.join(', ') 
                : rawData.instructions || 'Mix well',
            theme: rawData.theme || 'Cosmic influence',
            insight: insight
        };
    };

    const compactData = createCompactData(suggestion, searchQuery);
    console.log('Final compact data:', compactData);

    return (
        <div className="results-popup-overlay" onClick={handleOverlayClick}>
            <div className="results-popup-content">
                <button onClick={onClose} className="results-popup-close-button">
                    &times;
                </button>

                <div className="popup-body">
                    {error ? (
                        <div className="error-section">
                            <h3>Something went wrong</h3>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="compact-card-container">
                            <CompactHoroscopeCard data={compactData} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultsPopup;