    // Helper function to extract dish name from title or query (moved up for use in parseFoodPairingData)
    const extractDishName = (title: string, query?: string): string => {
        if (!title && !query) return "this dish";
        const source = title || query || "";
        return source.replace(/^(Perfect Pairing for|Perfect Pairings for)\s*/i, '').trim() || "this dish";
    };

    // Enhanced parsing function for food pairing
    const parseFoodPairingData = (suggestion: any): FoodPairingData | null => {
        const snippet = suggestion.snippet || suggestion.suggestion || '';
        const title = suggestion.title || '';
        if (!snippet) return null;
        // Enhanced regex patterns to capture each pairing section
        const winePairingMatch = snippet.match(/Wine Pairing:\s*([^.]+)\.\s*Wine Notes:\s*([^.]*(?:\.[^.]*)*?)(?=\s*Spirit Pairing:|$)/i);
        const spiritPairingMatch = snippet.match(/Spirit Pairing:\s*([^.]+)\.\s*Spirit Notes:\s*([^.]*(?:\.[^.]*)*?)(?=\s*Beer Pairing:|$)/i);
        const beerPairingMatch = snippet.match(/Beer Pairing:\s*([^.]+)\.\s*Beer Notes:\s*([^.]*(?:\.[^.]*)*?)(?=\s*$|$)/i);
        // Fallback patterns if the above don't work
        let wineName = 'Wine Selection';
        let wineNotes = 'Wine pairing information not available.';
        let spiritName = 'Spirit Selection';
        let spiritNotes = 'Spirit pairing information not available.';
        let beerName = 'Beer Selection';
        let beerNotes = 'Beer pairing information not available.';
        // Parse wine pairing
        if (winePairingMatch) {
            wineName = winePairingMatch[1].trim();
            wineNotes = winePairingMatch[2].trim();
            wineNotes = wineNotes.replace(/\s+/g, ' ').replace(/\.$/, '');
        }
        // Parse spirit pairing
        if (spiritPairingMatch) {
            spiritName = spiritPairingMatch[1].trim();
            spiritNotes = spiritPairingMatch[2].trim();
            spiritNotes = spiritNotes.replace(/\s+/g, ' ').replace(/\.$/, '');
        }
        // Parse beer pairing
        if (beerPairingMatch) {
            beerName = beerPairingMatch[1].trim();
            beerNotes = beerPairingMatch[2].trim();
            beerNotes = beerNotes.replace(/\s+/g, ' ').replace(/\.$/, '');
        }
        return {
            dishName: extractDishName(title, suggestion.originalQuery),
            comment: suggestion.enhancedComment?.text || '',
            winePairing: {
                name: wineName,
                notes: wineNotes
            },
            spiritPairing: {
                name: spiritName,
                notes: spiritNotes
            },
            beerPairing: {
                name: beerName,
                notes: beerNotes
            }
        };
    };

    // Enhanced detection logic for food pairing
    const detectFoodPairing = (suggestion: any): boolean => {
        if (!suggestion) return false;
        const snippet = suggestion.snippet || suggestion.suggestion || '';
        const title = suggestion.title || '';
        // Check for the specific pattern in your data
        const hasAllThreePairings = snippet.includes('Wine Pairing:') && 
                                   snippet.includes('Spirit Pairing:') && 
                                   snippet.includes('Beer Pairing:');
        const hasPairingInTitle = title.toLowerCase().includes('pairing') ||
                                 title.toLowerCase().includes('trio') ||
                                 title.toLowerCase().includes('steakhouse');
        const hasWillowParkSource = suggestion.filePath === "willowpark.net";
        // Check if it has the structured pairing format
        const hasStructuredPairings = snippet.includes('Wine Notes:') && 
                                     snippet.includes('Spirit Notes:') && 
                                     snippet.includes('Beer Notes:');
        return hasAllThreePairings || hasWillowParkSource || (hasPairingInTitle && hasStructuredPairings);
    };
import React, { useEffect, useState } from 'react';
import './ResultsPopup.css';
import CompactHoroscopeCard, { CompactCocktailCard } from './CompactHoroscopeCard';
import type { HoroscopeData, CocktailData } from './CompactHoroscopeCard';
import FoodPairingCard from './FoodPairingCard';
import type { FoodPairingData } from './FoodPairingCard';

interface ResultsPopupProps {
    isOpen: boolean;
    onClose: () => void;
    recipes: {
        classic: any;
        elevate: any;
    };
    currentRecipeType: 'classic' | 'elevate';
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
    visible,
    onUpgradeRequest 
}) => {
    const isVisible = isOpen || visible || false;
    
    // Local state to store both recipes
    const [storedRecipes, setStoredRecipes] = useState<{classic: any, elevate: any}>({
        classic: null,
        elevate: null
    });
    
    // Local state to track which recipe to display
    const [displayType, setDisplayType] = useState<'classic' | 'elevate'>('classic');

    // Store both recipes when they come in
    useEffect(() => {
        if (recipes.classic || recipes.elevate) {
            setStoredRecipes(prev => ({
                classic: recipes.classic || prev.classic,
                elevate: recipes.elevate || prev.elevate
            }));
        }
    }, [recipes]);

    // Initialize display type
    useEffect(() => {
        setDisplayType(currentRecipeType);
    }, [currentRecipeType]);

    // Handle upgrade button click - switch between stored recipes
    const handleLocalUpgrade = () => {
        if (storedRecipes.classic && storedRecipes.elevate) {
            setDisplayType(prev => prev === 'classic' ? 'elevate' : 'classic');
        } else if (onUpgradeRequest) {
            // Fallback to original upgrade request if elevate not stored
            onUpgradeRequest();
        }
    };

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

    // Get the recipe to display based on current display type
    const suggestion = displayType === 'elevate' && storedRecipes.elevate ? 
        storedRecipes.elevate : storedRecipes.classic;

    // (moved above for use in parseFoodPairingData)

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
                    .split(/,(?=\s*\d)|,(?=\s*[A-Zâ€¢])|;/)
                    .map(item => item.trim())
                    .filter(item => item.length > 0);
            }
            
            // Clean each ingredient
            ingredients = ingredients
                .map(item => {
                    let cleaned = item.trim();
                    // Remove leading bullets or dashes, but NOT numbers or decimals
                    cleaned = cleaned.replace(/^[-â€¢*\s]+/, '');
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
        const instructionsMatch = text.match(/(?:Instructions?|Method|Preparation):\s*([\s\S]*?)(?:\n\n|$)/i);
        if (instructionsMatch) {
            let instructions = instructionsMatch[1].trim();
            
            // Clean up the instructions
            instructions = instructions
                .replace(/\s+/g, ' ') // Normalize whitespace
                .replace(/^[-â€¢*]\s*/, '') // Remove leading bullets
                .trim();
            
            return instructions;
        }
        
        // Look for instruction-like sentences with action words
        const sentences = text.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 10);
        for (const sentence of sentences) {
            if (sentence.match(/\b(mix|stir|shake|add|pour|fill|garnish|serve|combine|build|muddle|strain|layer)/i)) {
                return sentence.replace(/^[-â€¢*]\s*/, '').trim();
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

        // Enhanced food pairing detection and parsing
        if (detectFoodPairing(suggestion)) {
            const foodPairingData = parseFoodPairingData(suggestion);
            if (foodPairingData) {
                return <FoodPairingCard data={foodPairingData} />;
            }
            // Fallback if parsing fails, show raw data for debugging
            return (
                <div className="error-section">
                    <h3>Pairing Information</h3>
                    <p>Unable to parse pairing details properly.</p>
                    <div className="text-xs text-gray-500 mt-2">
                        <details>
                            <summary>Raw Data</summary>
                            <pre>{JSON.stringify(suggestion, null, 2)}</pre>
                        </details>
                    </div>
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
                insight: suggestion.fourLineIdiom || suggestion.insight || 'A mystical cocktail experience awaits.'
            };

            return (
                <CompactHoroscopeCard data={horoscopeData} />
            );
        }

        // Check if this is a structured cocktail result (has snippet with ingredients)
        const hasCocktailStructure = suggestion.snippet && 
                                   (suggestion.snippet.toLowerCase().includes('ingredients:') ||
                                    suggestion.snippet.toLowerCase().includes('method:') ||
                                    suggestion.snippet.toLowerCase().includes('instructions:'));

        if (hasCocktailStructure) {
            // Extract ingredients with enhanced parsing (prefer full measurements)
            let ingredients: string[] = [];
            if (suggestion && suggestion.snippet) {
                // Try to extract array from snippet if present
                const arrayMatch = suggestion.snippet.match(/Ingredients:\s*\[([^\]]+)\]/i);
                if (arrayMatch) {
                    ingredients = arrayMatch[1]
                        .split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
                        .map((item: string) => item.replace(/^\s*['"]?|['"]?\s*$/g, '').trim())
                        .filter((item: string) => item.length > 0);
                } else {
                    ingredients = extractIngredients(suggestion.snippet);
                }
            } else {
                ingredients = ['Ingredients not specified'];
            }

            const instructions = extractInstructions(suggestion.snippet);
            const cocktailName = cleanCocktailName(suggestion.title);

            // Format cocktail data with local upgrade handler
            const cocktailData: CocktailData = {
                cocktailName: cocktailName,
                ingredients: ingredients,
                instructions: instructions,
                comment: suggestion.enhancedComment?.text || '',
                bartenderLine: suggestion.bartenderLine || '',
                originalQuery: suggestion.originalQuery,
                // Use local upgrade if both recipes stored, otherwise use external handler
                onUpgrade: (storedRecipes.classic && storedRecipes.elevate) ? 
                    () => handleLocalUpgrade() : 
                    (onUpgradeRequest || undefined)
            };

            return (
                <CompactCocktailCard data={cocktailData} />
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

    // Handle overlay click to close popup if clicked outside the content
    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        // Only close if the user clicks directly on the overlay, not on children
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="results-popup-overlay" onClick={handleOverlayClick}>
            <button onClick={onClose} className="results-popup-close-button">
                &times;
            </button>
            <div className="universal-card-container"> {/* Add this class */}
                {renderContent()}
            </div>
        </div>
    );
};

export default ResultsPopup;