import React, { useEffect } from 'react';
import './ResultsPopup.css';

interface ResultsPopupProps {
    isOpen: boolean;
    onClose: () => void;
    suggestion: string | null;
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

    // Parse mixologist response into structured parts
    const parseResponse = (text: string) => {
        // Extract drink name (first sentence or specific pattern)
        const drinkNameMatch = text.match(/(?:"|“)([^"”]+)(?:"|”)/);
        const drinkName = drinkNameMatch ? drinkNameMatch[1] : 'Unnamed Drink';

        // Extract description (everything before ingredients/steps)
        let description = text;
        let ingredients: string[] = [];
        let steps: string[] = [];

        // Find ingredients section
        const ingredientsMatch = text.match(/ingredients?:?\s*([\s\S]*?)(?=(?:steps?|instructions?|method):|$)/i);
        if (ingredientsMatch) {
            const ingredientsText = ingredientsMatch[1].trim();
            ingredients = ingredientsText
                .split(/[,\n]/)
                .map(item => item.trim())
                .filter(item => item && item.length > 2)
                .slice(0, 6); // Limit to 6 ingredients to fit

            // Remove ingredients section from description
            description = text.replace(ingredientsMatch[0], '').trim();
        }

        // Find steps/instructions section
        const stepsMatch = text.match(/(?:steps?|instructions?|method):?\s*([\s\S]*?)$/i);
        if (stepsMatch) {
            const stepsText = stepsMatch[1].trim();
            steps = stepsText
                .split(/(?:\d+\.|\n)/)
                .map(step => step.trim())
                .filter(step => step && step.length > 5)
                .slice(0, 5); // Limit to 5 steps to fit

            // Remove steps section from description
            description = description.replace(stepsMatch[0], '').trim();
        }

        // If no structured ingredients/steps found, try to extract from general text
        if (ingredients.length === 0 || steps.length === 0) {
            const lines = text.split('\n').filter(line => line.trim());
            
            // Look for lines that might be ingredients (contain measurements, common ingredients)
            const possibleIngredients = lines.filter(line => {
                const lower = line.toLowerCase();
                return /\d+\s*(oz|ounce|ml|cl|cup|tbsp|tsp|splash|dash)/.test(lower) ||
                       /(rum|vodka|gin|whiskey|bourbon|tequila|beer|wine|lime|lemon|sugar|syrup)/.test(lower);
            }).slice(0, 4);

            if (possibleIngredients.length > 0 && ingredients.length === 0) {
                ingredients = possibleIngredients;
            }

            // Look for action words that indicate steps
            const possibleSteps = lines.filter(line => {
                const lower = line.toLowerCase();
                return /(add|pour|fill|shake|stir|mix|garnish|serve|top|strain)/.test(lower) && 
                       line.length > 10;
            }).slice(0, 4);

            if (possibleSteps.length > 0 && steps.length === 0) {
                steps = possibleSteps;
            }
        }

        // Clean up description - take first meaningful paragraph
        const descriptionParagraphs = description.split(/\n\n|\. /).filter(p => p.trim().length > 20);
        const cleanDescription = descriptionParagraphs[0]?.trim() || text.split('\n')[0] || text.substring(0, 200) + '...';

        return {
            drinkName,
            description: cleanDescription,
            ingredients: ingredients.length > 0 ? ingredients : ['Information not available in structured format'],
            steps: steps.length > 0 ? steps : ['Please refer to the description above for preparation details']
        };
    };

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
                    ) : suggestion ? (
                        <>
                            {/* Drink Name */}
                            <div className="drink-name">
                                <h3>{parseResponse(suggestion).drinkName}</h3>
                            </div>

                            {/* Top Row - Description */}
                            <div className="mixologist-description">
                                <h4>🍸 Mixologist's Suggestion</h4>
                                <div className="mixologist-description-text">
                                    {parseResponse(suggestion).description}
                                </div>
                            </div>

                            {/* Bottom Row - Ingredients & Steps */}
                            <div className="recipe-container">
                                {/* Ingredients (2/5 width) */}
                                <div className="ingredients-section">
                                    <h4>📝 Ingredients</h4>
                                    <div className="ingredients-list">
                                        {parseResponse(suggestion).ingredients.map((ingredient, index) => (
                                            <div key={index} className="ingredient-item">
                                                <span>{ingredient}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Steps (3/5 width) */}
                                <div className="steps-section">
                                    <h4>🔄 Steps</h4>
                                    <div className="steps-list">
                                        {parseResponse(suggestion).steps.map((step, index) => (
                                            <div key={index} className="step-item">
                                                <span>{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="loading-container">
                            <h3>Getting mixologist's suggestion...</h3>
                            <div className="loading-spinner" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultsPopup;