import React, { useEffect } from 'react';
import './ResultsPopup.css';
import CompactHoroscopeCard, { CompactCocktailCard } from './CompactHoroscopeCard';
import type { HoroscopeData, CocktailData } from './CompactHoroscopeCard';

interface ResultsPopupProps {
    isOpen: boolean;
    onClose: () => void;
    suggestion: any; // Can be horoscope data or mixologist response
    error: string | null;
    searchQuery?: string;
    visible?: boolean;
}

const ResultsPopup: React.FC<ResultsPopupProps> = ({ 
    isOpen, 
    onClose, 
    suggestion, 
    error, 
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

    // Helper function to extract ingredients from text
    const extractIngredients = (text: string): string[] => {
        if (!text) return ['No ingredients available'];
        
        // Look for "Ingredients:" followed by content
        const ingredientsMatch = text.match(/Ingredients:\s*([^.]*(?:\.[^.]*)*?)\.?\s*(?:Instructions?:|Method:|$)/i);
        if (ingredientsMatch) {
            const ingredientsText = ingredientsMatch[1].trim();
            return ingredientsText
                .split(/,|\band\b/)
                .map(item => item.trim())
                .filter(item => item.length > 2)
                .map(item => item.replace(/^\d+\s*(oz|ml|cups?|tbsp|tsp)\s*/i, '').trim())
                .filter(item => item.length > 0)
                .slice(0, 6); // Limit to 6 ingredients for display
        }
        
        return ['Ingredients not specified'];
    };

    // Helper function to extract instructions from text  
    const extractInstructions = (text: string): string => {
        if (!text) return 'No instructions available';
        
        // Look for "Instructions:" or "Method:" followed by content
        const instructionsMatch = text.match(/(?:Instructions?|Method):\s*(.+?)(?:\.|$)/i);
        if (instructionsMatch) {
            return instructionsMatch[1].trim();
        }
        
        // Look for instruction-like sentences
        const sentences = text.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 10);
        for (const sentence of sentences) {
            if (sentence.match(/\b(mix|stir|shake|add|pour|fill|garnish|serve|combine|build)/i)) {
                return sentence;
            }
        }
        
        return 'Method not specified';
    };

    // Helper function to clean cocktail names
    const cleanCocktailName = (title: string): string => {
        if (!title) return 'Cocktail Recommendation';
        
        return title
            .replace(/^(The Classic:|Direct Interpretation:|Creative Interpretation:|Classic & Simple:|Creative Twist:|Simple |Premium |Modern |Alternative |Signature )/i, '')
            .replace(/ - .*$/, '') // Remove everything after dash
            .trim();
    };

    // Helper function to extract description/comment
    const extractComment = (text: string): string => {
        if (!text) return 'A carefully crafted cocktail recommendation.';
        
        // Look for description before ingredients
        const beforeIngredients = text.split(/Ingredients?:/i)[0].trim();
        if (beforeIngredients.length > 20) {
            return beforeIngredients.replace(/^(Concept:|Pairing Notes?:)/i, '').trim();
        }
        
        return 'A delicious cocktail crafted with care.';
    };

    // Determine result type and render accordingly
    const renderContent = () => {
        if (error) {
            return (
                <div className="error-section">
                    <h3>Something went wrong</h3>
                    <p>{error}</p>
                </div>
            );
        }

        if (!suggestion) {
            return (
                <div className="error-section">
                    <h3>No Results</h3>
                    <p>No recommendations found for your search.</p>
                </div>
            );
        }

        // Check if this is a horoscope result (has cosmic properties)
        const isHoroscopeResult = suggestion.sign && 
                                 suggestion.sign !== 'Mixologist' &&
                                 (suggestion.moonPhase || suggestion.ruler || suggestion.element);

        if (isHoroscopeResult) {
            // Format horoscope data
            const horoscopeData: HoroscopeData = {
                sign: suggestion.sign || 'Unknown',
                cocktailName: suggestion.cocktailName || 'Cosmic Cocktail',
                moonPhase: suggestion.moonPhase || 'current phase',
                ruler: suggestion.ruler || 'Mercury',
                element: suggestion.element || 'Spirit',
                ingredients: Array.isArray(suggestion.ingredients) ? suggestion.ingredients : ['Premium spirits', 'Quality mixers'],
                instructions: Array.isArray(suggestion.instructions) 
                    ? suggestion.instructions.join(', ') 
                    : suggestion.instructions || 'Mix with cosmic intention',
                theme: suggestion.theme || 'Astrological influence',
                insight: suggestion.insight || 'A mystical cocktail experience awaits.'
            };

            return (
                <div className="compact-card-container">
                    <CompactHoroscopeCard data={horoscopeData} />
                </div>
            );
        }

        // Check if this is a structured cocktail result (has snippet with ingredients)
        const hasCocktailStructure = suggestion.snippet && 
                                   (suggestion.snippet.toLowerCase().includes('ingredients:') ||
                                    suggestion.snippet.toLowerCase().includes('method:') ||
                                    suggestion.snippet.toLowerCase().includes('instructions:'));

        if (hasCocktailStructure) {
            // Format cocktail data
            const cocktailData: CocktailData = {
                cocktailName: cleanCocktailName(suggestion.title),
                ingredients: extractIngredients(suggestion.snippet),
                instructions: extractInstructions(suggestion.snippet),
                comment: extractComment(suggestion.snippet)
            };

            return (
                <div className="compact-card-container">
                    <CompactCocktailCard data={cocktailData} />
                </div>
            );
        }

        // Fallback for general search results
        return (
            <div className="general-search-result">
                <h2 className="search-result-title">
                    {suggestion.title || 'Mixologist Recommendation'}
                </h2>
                <div className="search-result-content">
                    <div className="search-result-snippet">
                        {suggestion.snippet || 
                         suggestion.mixologistSuggestion || 
                         suggestion.content || 
                         'No specific recommendation available.'}
                    </div>
                    {suggestion.filePath && (
                        <div className="search-result-source">
                            Source: {suggestion.filePath}
                        </div>
                    )}
                    {suggestion.why && (
                        <div className="search-result-reasoning">
                            <strong>Why this recommendation:</strong> {suggestion.why}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="results-popup-overlay" onClick={handleOverlayClick}>
            <div className="results-popup-content">
                <button onClick={onClose} className="results-popup-close-button">
                    &times;
                </button>
                <div className="popup-body">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ResultsPopup;