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

    const capitalizeTitle = (title: string) => {
        return title.toLowerCase().split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Helper function to format ingredient names
    const formatIngredientName = (ingredient: string): string => {
        return ingredient
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    };

    // Create proper data format for CompactHoroscopeCard
    const createCompactData = (rawData: any, query?: string): HoroscopeData => {
        console.log('Raw suggestion data:', rawData);
        console.log('Search query:', query);

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

        // Create proper ingredients array from individual components
        const ingredients = [];
        if (rawData.base && rawData.base !== 'Premium Spirit') {
            ingredients.push(`2oz ${formatIngredientName(rawData.base)}`);
        }
        if (rawData.mixer && rawData.mixer !== 'Quality Mixer') {
            ingredients.push(formatIngredientName(rawData.mixer));
        }
        if (rawData.citrus && rawData.citrus !== 'Fresh Garnish') {
            ingredients.push(formatIngredientName(rawData.citrus));
        }

        // Fallback ingredients if none found
        if (ingredients.length === 0) {
            ingredients.push('Premium Spirits', 'Quality Mixers', 'Fresh Garnish');
        }

        return {
            sign: rawData.sign || 'Mixologist',
            cocktailName: rawData.cocktailName || 'Special Recommendation',
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

                {searchQuery && (
                    <h2 className="popup-main-title">
                        <strong>{capitalizeTitle(searchQuery)}</strong>
                    </h2>
                )}

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