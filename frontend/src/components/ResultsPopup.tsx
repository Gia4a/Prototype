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

    // Enhanced helper function to extract ingredients WITH measurements
    const extractIngredients = (text: string): string[] => {
        if (!text) return ['No ingredients available'];
        
        // Look for "Ingredients:" followed by content
        const ingredientsMatch = text.match(/Ingredients:\s*([^.]*(?:\.[^.]*)*?)\.?\s*(?:Instructions?:|Method:|Preparation:|$)/i);
        if (ingredientsMatch) {
            const ingredientsText = ingredientsMatch[1].trim();
            
            // Split by common delimiters but preserve measurements
            const ingredients = ingredientsText
                .split(/,(?=\s*\d)|,(?=\s*[A-Z])|;|\n/)
                .map(item => {
                    let cleaned = item.trim();
                    
                    // Remove leading bullets or dashes
                    cleaned = cleaned.replace(/^[-•*]\s*/, '');
                    
                    // Remove trailing periods but keep decimal points in measurements
                    cleaned = cleaned.replace(/\.$/, '');
                    
                    return cleaned;
                })
                .filter(item => {
                    // Filter out empty items and very short non-meaningful entries
                    return item.length > 2 && 
                           !item.match(/^(and|or|plus|with)$/i);
                })
                .slice(0, 8); // Limit to 8 ingredients for display
            
            return ingredients.length > 0 ? ingredients : ['Ingredients not specified'];
        }
        
        // Fallback: try to find measurement patterns in the text
        const measurementPattern = /(?:\d+(?:\.\d+)?\s*(?:oz|ml|cups?|tbsp|tsp|cl|dash|splash|drops?|barspoons?))[^,;.\n]*/gi;
        const foundMeasurements = text.match(measurementPattern);
        
        if (foundMeasurements && foundMeasurements.length > 0) {
            return foundMeasurements
                .map(item => item.trim())
                .filter(item => item.length > 3)
                .slice(0, 6);
        }
        
        return ['Ingredients not specified'];
    };

    // Enhanced helper function to extract instructions
    const extractInstructions = (text: string): string => {
        if (!text) return 'No instructions available';
        
        // Look for "Instructions:", "Method:", or "Preparation:" followed by content
        const instructionsMatch = text.match(/(?:Instructions?|Method|Preparation):\s*(.+?)(?:\.|$)/i);
        if (instructionsMatch) {
            let instructions = instructionsMatch[1].trim();
            
            // Clean up the instructions
            instructions = instructions
                .replace(/\s+/g, ' ') // Normalize whitespace
                .replace(/^[-•*]\s*/, '') // Remove leading bullets
                .trim();
            
            return instructions;
        }
        
        // Look for instruction-like sentences with action words
        const sentences = text.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 10);
        for (const sentence of sentences) {
            if (sentence.match(/\b(mix|stir|shake|add|pour|fill|garnish|serve|combine|build|muddle|strain|layer)/i)) {
                return sentence.replace(/^[-•*]\s*/, '').trim();
            }
        }
        
        // Last resort: look for any sentence that seems like preparation
        const preparationSentence = sentences.find(s => 
            s.length > 20 && 
            (s.includes('ingredients') || s.includes('glass') || s.includes('ice'))
        );
        
        return preparationSentence ? preparationSentence.trim() : 'Method not specified';
    };

    // Enhanced helper function to clean cocktail names
    const cleanCocktailName = (title: string): string => {
        if (!title) return 'Cocktail Recommendation';
        
        return title
            .replace(/^(The Classic:|Direct Interpretation:|Creative Interpretation:|Classic & Simple:|Creative Twist:|Simple |Premium |Modern |Alternative |Signature |Craft )/i, '')
            .replace(/ - .*$/, '') // Remove everything after dash
            .replace(/\s+Recipe$/i, '') // Remove "Recipe" suffix
            .replace(/\s+Cocktail$/i, '') // Remove redundant "Cocktail" suffix if the name already implies it
            .trim();
    };

    // Enhanced helper function to extract description/comment with 1920s Chicago bartender personality
    const extractComment = (text: string): string => {
        if (!text) return getChicagoBartenderMessage();
        
        // Look for description before ingredients
        const beforeIngredients = text.split(/Ingredients?:/i)[0].trim();
        if (beforeIngredients.length > 20) {
            let comment = beforeIngredients
                .replace(/^(Concept:|Pairing Notes?:|Description:)/i, '')
                .trim();
            
            // If it's too long, take just the first sentence
            const firstSentence = comment.split(/[.!?]/)[0].trim();
            return firstSentence.length > 10 ? firstSentence : comment;
        }
        
        // Look for "why" explanations
        const whyMatch = text.match(/(?:why|reason|because)[\s:]*([^.!?]+)/i);
        if (whyMatch && whyMatch[1]) {
            return whyMatch[1].trim();
        }
        
        // Look for pairing notes
        const pairingMatch = text.match(/(?:pairing|notes?|works?)[\s:]*([^.!?]+)/i);
        if (pairingMatch && pairingMatch[1]) {
            return pairingMatch[1].trim();
        }
        
        return getChicagoBartenderMessage();
    };

    // 1920s Chicago bartender personality messages
    const getChicagoBartenderMessage = (): string => {
        const messages = [
            "Listen here, friend - this here's a real humdinger that'll put some pep in your step.",
            "Now that's the cat's pajamas! A drink that's the bee's knees and then some.",
            "This little number's been packin' 'em in at the speakeasy since before you were knee-high to a grasshopper.",
            "Say, this cocktail's the real McCoy - none of that bathtub gin nonsense.",
            "Hot diggity! This drink's got more kick than a Chicago thoroughbred.",
            "Now don't go tellin' the feds, but this recipe's straight from the finest joint on the South Side.",
            "This drink's smoother than a con man's pitch and twice as satisfying.",
            "Kid, you're lookin' at liquid gold - the kind that made Chicago famous.",
            "This here concoction's got more class than a Northside socialite.",
            "Now that's what I call a real sockdolager of a drink!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    };

    // Helper function to determine if ingredients look complete (have measurements)
    const hasDetailedIngredients = (ingredients: string[]): boolean => {
        return ingredients.some(ingredient => 
            /\d+(?:\.\d+)?\s*(?:oz|ml|cups?|tbsp|tsp|cl|dash|splash)/i.test(ingredient)
        );
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
            // Extract ingredients with enhanced parsing
            const ingredients = extractIngredients(suggestion.snippet);
            
            // Format cocktail data
            const cocktailData: CocktailData = {
                cocktailName: cleanCocktailName(suggestion.title),
                ingredients: ingredients,
                instructions: extractInstructions(suggestion.snippet),
                comment: extractComment(suggestion.snippet)
            };

            // Add debugging info if ingredients don't have measurements
            if (!hasDetailedIngredients(ingredients)) {
                console.warn('Ingredients may be missing measurements:', ingredients);
                console.log('Original snippet:', suggestion.snippet);
            }

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