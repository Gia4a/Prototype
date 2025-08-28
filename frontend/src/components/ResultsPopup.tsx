import React, { useEffect } from 'react';
import './ResultsPopup.css';
import CompactHoroscopeCard from './CompactHoroscopeCard';



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

    // Force everything through CompactHoroscopeCard - no exceptions!
    const createCompactData = (rawData: any, query?: string) => {
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

        // If it's already a proper object with the right structure
        if (typeof rawData === 'object' && rawData.sign && rawData.cocktailName) {
            return {
                sign: rawData.sign,
                cocktailName: rawData.cocktailName,
                moonPhase: rawData.moonPhase || 'current phase',
                ruler: rawData.ruler || 'Mercury',
                element: rawData.element || 'Spirit',
                ingredients: [
                    rawData.base || 'Base Spirit',
                    rawData.mixer || 'Mixer',
                    rawData.citrus || 'Garnish'
                ],
                instructions: Array.isArray(rawData.instructions) 
                    ? rawData.instructions.join(', ') 
                    : rawData.instructions || 'Mix well',
                theme: rawData.theme || 'Cosmic influence',
                insight: rawData.insight || 'Enjoy responsibly'
            };
        }

        // If it's a string (most common case)
        const dataString = typeof rawData === 'string' ? rawData : JSON.stringify(rawData);
        
        // Extract sign from query or default
        let sign = 'Mixologist';
        if (query && query.includes('Cosmic Cocktail')) {
            sign = query.replace(' Cosmic Cocktail', '');
        }

        // Try to extract cocktail name from the string
        let cocktailName = 'Special Cocktail';
        
        // Look for common cocktail patterns
        const cocktailPatterns = [
            /([A-Za-z\s']+(?:Martini|Manhattan|Old Fashioned|Negroni|Daiquiri|Margarita|Mojito|Cosmopolitan|Sidecar|Gimlet))/gi,
            /([A-Za-z\s']+Cocktail)/gi,
            /([A-Za-z\s']+Sour)/gi,
            /([A-Za-z\s']+Fizz)/gi
        ];

        for (const pattern of cocktailPatterns) {
            const match = dataString.match(pattern);
            if (match && match[0]) {
                cocktailName = match[0].trim();
                break;
            }
        }

        // If no cocktail found, create one based on query
        if (cocktailName === 'Special Cocktail' && query) {
            cocktailName = `${sign}'s Special`;
        }

        // Extract basic ingredients and instructions
        let ingredients = ['Premium Spirits', 'Quality Mixers', 'Fresh Garnish'];
        let instructions = 'Mix according to mixologist recommendations';
        
        // Try to find ingredients in the string
        const ingredientKeywords = ['vodka', 'gin', 'whiskey', 'rum', 'tequila', 'bourbon', 'scotch'];
        const foundSpirit = ingredientKeywords.find(spirit => 
            dataString.toLowerCase().includes(spirit)
        );
        
        if (foundSpirit) {
            ingredients[0] = foundSpirit.charAt(0).toUpperCase() + foundSpirit.slice(1);
        }

        // Create a clean insight from the beginning of the string
        let insight = 'A carefully crafted cocktail recommendation.';
        if (dataString.length > 50) {
            // Take first meaningful sentence or up to 120 characters
            const sentences = dataString.split('.').filter(s => s.trim().length > 20);
            if (sentences.length > 0) {
                insight = sentences[0].trim() + '.';
            } else {
                insight = dataString.substring(0, 120).trim() + '...';
            }
        }

        return {
            sign: sign,
            cocktailName: cocktailName,
            moonPhase: 'current phase',
            ruler: 'Mercury',
            element: 'Spirit',
            ingredients: ingredients,
            instructions: instructions,
            theme: 'Mixologist recommendation',
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