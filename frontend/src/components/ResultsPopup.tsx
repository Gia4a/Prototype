import React, { useEffect } from 'react';
import './ResultsPopup.css';
import CompactHoroscopeCard, { CompactCocktailCard } from './CompactHoroscopeCard';
import type { HoroscopeData, CocktailData } from './CompactHoroscopeCard';

interface ResultsPopupProps {
    isOpen: boolean;
    onClose: () => void;
    recipes: {
        classic: any;
        premium: any;
    };
    currentRecipeType: 'classic' | 'premium';
    error: string | null;
    visible?: boolean;
    onUpgradeRequest?: () => void;
}

const ResultsPopup: React.FC<ResultsPopupProps> = ({ 
    isOpen, 
    onClose, 
    recipes,
    currentRecipeType,
    error, 
    // searchQuery removed
    visible,
    onUpgradeRequest 
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

    // Pick the recipe to display
    const suggestion = currentRecipeType === 'premium' && recipes.premium ? recipes.premium : recipes.classic;

    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    // Enhanced helper function to extract ingredients WITH measurements
    const extractIngredients = (text: string): string[] => {
        if (!text) return ['No ingredients available'];
        
        // Look for "Ingredients:" followed by content, stopping at "Instructions:" or similar
        const ingredientsMatch = text.match(/Ingredients:\s*([\s\S]*?)(?=\s*Instructions?:|Method:|Preparation:|$)/i);
        if (ingredientsMatch) {
            const ingredientsText = ingredientsMatch[1].trim();
            
            // Split by line breaks first, then by commas if needed
            let ingredients = ingredientsText
                .split(/\n/)
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            // If we only got one line, try splitting by commas but be careful with measurements
            if (ingredients.length === 1 && ingredients[0].includes(',')) {
                ingredients = ingredients[0]
                    .split(/,(?=\s*\d)|,(?=\s*[A-Z•])|;/)
                    .map(item => item.trim())
                    .filter(item => item.length > 0);
            }
            
            // Clean each ingredient
            ingredients = ingredients
                .map(item => {
                    let cleaned = item.trim();
                    
                    // Remove leading bullets, dashes, or numbers
                    cleaned = cleaned.replace(/^[-•*\d+.\s]*/, '');
                    
                    // Remove trailing periods but keep decimal points in measurements
                    cleaned = cleaned.replace(/\.$/, '');
                    
                    return cleaned;
                })
                .filter(item => {
                    // Filter out empty items, instruction-like text, and very short entries
                    return item.length > 2 && 
                           !item.match(/^(and|or|plus|with|fill|add|shake|stir|strain|garnish|top|serve)$/i) &&
                           !item.match(/^\d+\.\s*$/); // Remove standalone numbers
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

    // Enhanced helper function to extract description/comment
    const extractComment = (text: string): string => {
        if (!text) return "A delightful cocktail crafted just for you!";
        
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
        
        return "A wonderfully crafted cocktail experience!";
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
                comment: suggestion.enhancedComment || extractComment(suggestion.snippet),
                originalQuery: suggestion.originalQuery,
                onUpgrade: undefined // handled by ResultsPopup
            };

            // Add debugging info if ingredients don't have measurements
            if (!hasDetailedIngredients(ingredients)) {
                console.warn('Ingredients may be missing measurements:', ingredients);
                console.log('Original snippet:', suggestion.snippet);
            }

            return (
                <div className="compact-card-container">
                    <CompactCocktailCard data={cocktailData} />
                    {/* Toggle button for upgrade */}
                    {recipes.premium && (
                        <button
                            style={{ marginTop: 12, background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }}
                            onClick={onUpgradeRequest}
                        >
                            {currentRecipeType === 'classic' ? '🔥 Show Premium Recipe' : '⬅️ Back to Classic'}
                        </button>
                    )}
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