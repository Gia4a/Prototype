// cocktailUpgradeService.ts - Client-side upgrade service
export type UpgradeType = 'seasonal' | 'spicy' | 'premium' | 'festive';

export interface UpgradeResponse {
  originalQuery: string;
  suggestion: string;
  title?: string;
  content?: string;
  filePath?: string;
  results?: any[];
  searchType?: string;
  snippet?: string;
  why?: string;
  enhancedComment?: {
    poeticDescription?: string;
    personalComment?: string;
    upgradeComment?: string;
  };
  supportsUpgrade?: boolean;
  upgradeType?: string;
}

class CocktailUpgradeService {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    // Main upgrade function that processes the original cocktail
    async getUpgradedCocktail(originalQuery: string, upgradeType: UpgradeType): Promise<UpgradeResponse> {
        try {
            console.log(`Generating ${upgradeType} upgrade for: ${originalQuery}`);
            
            // Get current season for seasonal upgrades
            const currentSeason = this.getCurrentSeason();
            
            // Generate the upgraded recipe using API call to your backend
            const upgradeResult = await this.callUpgradeAPI(originalQuery, upgradeType, currentSeason);

            if (!upgradeResult) {
                throw new Error('Failed to generate upgrade recipe');
            }

            // Extract ingredients for comment generation
            const ingredients = this.extractIngredients(upgradeResult.snippet || '');
            
            // Generate enhanced comment for the upgraded cocktail
            const enhancedComment = await this.generateUpgradeComment(
                upgradeResult.title || `Upgraded ${originalQuery}`,
                ingredients,
                currentSeason,
                upgradeType
            );

            // Format the complete response
            const response: UpgradeResponse = {
                originalQuery: originalQuery,
                suggestion: upgradeResult.snippet || '',
                title: upgradeResult.title || `${this.capitalizeUpgradeType(upgradeType)} ${originalQuery}`,
                snippet: upgradeResult.snippet || '',
                why: upgradeResult.why || `Enhanced ${upgradeType} version of the original recipe`,
                enhancedComment: enhancedComment,
                searchType: 'upgrade',
                upgradeType: upgradeType,
                supportsUpgrade: true // Enable further upgrades
            };

            console.log('Upgrade response generated:', response);
            return response;

        } catch (error) {
            console.error('Upgrade generation failed:', error);
            
            // Return fallback upgraded response
            return this.createFallbackUpgrade(originalQuery, upgradeType);
        }
    }

    // API call to generate upgrade recipe

    private async callUpgradeAPI(originalQuery: string, upgradeType: UpgradeType, season: string) {
        const upgradePrompts: Record<UpgradeType, string> = {
            seasonal: `Create a ${season} seasonal upgrade of "${originalQuery}" using seasonal ingredients`,
            spicy: `Create a spicy/bold upgrade of "${originalQuery}" using hot peppers and bold flavors`,
            premium: `Create a premium upgrade of "${originalQuery}" using top-shelf ingredients and sophisticated techniques`,
            festive: `Create a festive/holiday upgrade of "${originalQuery}" with celebration themes and special ingredients`
        };

        const promptText = `
${upgradePrompts[upgradeType]}

Return JSON format:
{"title": "Upgraded Cocktail Name", "snippet": "Ingredients: detailed list with measurements including premium/seasonal/spicy ingredients. Instructions: complete preparation method with any special techniques.", "filePath": null, "why": "explanation of the upgrade"}

Requirements:
`;

        const requestBody = {
            contents: [{
                parts: [{ text: promptText }]
            }],
            generationConfig: {
                temperature: 0.8,
                topK: 40,
                topP: 0.9,
                maxOutputTokens: 1024,
                candidateCount: 1
            }
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${this.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!responseText) {
            throw new Error('Invalid API response structure');
        }

        return this.parseAPIResponse(responseText);
    }

    // Generate enhanced comment for upgraded cocktail
    private async generateUpgradeComment(cocktailName: string, ingredients: string[], season: string, upgradeType: UpgradeType) {
        const promptText = `
Create a personalized comment for the upgraded cocktail "${cocktailName}" with these ingredients: ${ingredients.join(', ')}.

This is a ${upgradeType} upgrade for ${season} season.

Format your response as JSON:
{
    "poeticDescription": "2-line poetic description emphasizing the upgrade (each line under 40 characters)",
    "personalComment": "encouraging comment about this upgraded recipe (under 50 characters)",
    "upgradeComment": "suggestion for another upgrade type (under 50 characters)"
}

Requirements:
`;

        try {
            const requestBody = {
                contents: [{
                    parts: [{ text: promptText }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.9,
                    maxOutputTokens: 512,
                    candidateCount: 1
                }
            };

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                }
            );

            if (!response.ok) {
                throw new Error(`Comment API request failed: ${response.status}`);
            }

            const data = await response.json();
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (responseText) {
                const parsed = this.parseAPIResponse(responseText);
                if (parsed) return parsed;
            }
            
            throw new Error('Could not parse comment response');
            
        } catch (error) {
            if (error instanceof Error) {
                console.error('Comment generation failed:', error.message);
            } else {
                console.error('Comment generation failed:', error);
            }
            
            // Fallback comment based on upgrade type
            const upgradeMessages: Record<UpgradeType, string> = {
                seasonal: `${season}'s finest creation,\nUpgraded for pure sensation.`,
                spicy: `Heat and flavor combined,\nBold upgrade that's perfectly designed.`,
                premium: `Luxury in liquid form,\nUpgraded beyond the norm.`,
                festive: `Celebration in a glass,\nUpgraded joy that's built to last.`
            };

            return {
                poeticDescription: upgradeMessages[upgradeType],
                personalComment: `Your ${upgradeType} upgrade is ready to impress!`,
                upgradeComment: "Want to try another upgrade style?"
            };
        }
    }

    // Parse API response and extract JSON
    private parseAPIResponse(responseText: string) {
        try {
            // Remove markdown code blocks
            let cleanText = responseText.replace(/```(?:json|JSON)?\s*([\s\S]*?)\s*```/g, '$1');
            
            // Find JSON boundaries
            let startIdx = cleanText.indexOf('{');
            let endIdx = cleanText.lastIndexOf('}');
            
            if (startIdx === -1 || endIdx === -1) {
                throw new Error('No JSON found in response');
            }
            
            cleanText = cleanText.substring(startIdx, endIdx + 1);
            
            // Try parsing
            const parsed = JSON.parse(cleanText);
            return parsed;
            
        } catch (error) {
            if (error instanceof Error) {
                console.error('Failed to parse API response:', error.message);
            } else {
                console.error('Failed to parse API response:', error);
            }
            return null;
        }
    }

    // Helper function to extract ingredients from snippet text
    private extractIngredients(text: string): string[] {
        if (!text) return ['Premium spirits', 'Quality mixers'];
        
        const ingredientsMatch = text.match(/Ingredients:\s*([\s\S]*?)(?=\s*Instructions?:|Method:|Preparation:|$)/i);
        if (ingredientsMatch) {
            const ingredientsText = ingredientsMatch[1].trim();
            
            let ingredients = ingredientsText
                .split(/\n|,/)
                .map(line => line.trim())
                .filter(line => line.length > 2)
                .map(item => item.replace(/^[-•*\d+.\s]*/, '').trim())
                .filter(item => item.length > 2)
                .slice(0, 6);
            
            return ingredients.length > 0 ? ingredients : ['Premium spirits', 'Quality mixers'];
        }
        
        return ['Premium spirits', 'Quality mixers'];
    }

    // Helper function to get current season
    private getCurrentSeason(): string {
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'fall';
        return 'winter';
    }

    // Helper function to get seasonal ingredients
    private getSeasonalIngredients(season: string): string {
        const seasonalMap: Record<string, string> = {
            spring: 'fresh herbs, elderflower, strawberries, rhubarb, lavender',
            summer: 'watermelon, peach, berries, basil, mint, cucumber',
            fall: 'apple, pear, cinnamon, maple, cranberries, ginger',
            winter: 'citrus, pomegranate, rosemary, cloves, hot spices'
        };
        return seasonalMap[season] || seasonalMap.summer;
    }

    // Helper function to capitalize upgrade type
    private capitalizeUpgradeType(upgradeType: UpgradeType): string {
        const typeMap: Record<UpgradeType, string> = {
            seasonal: 'Seasonal',
            spicy: 'Spicy',
            premium: 'Premium',
            festive: 'Festive'
        };
        return typeMap[upgradeType] || 'Enhanced';
    }

    // Fallback upgrade response if API fails
    private createFallbackUpgrade(originalQuery: string, upgradeType: UpgradeType): UpgradeResponse {
        // upgradeDescriptions removed as it was unused
        const fallbackIngredients: Record<UpgradeType, string[]> = {
            seasonal: ['2 oz premium spirit', '1 oz seasonal syrup', '0.5 oz fresh citrus', 'seasonal garnish'],
            spicy: ['2 oz premium spirit', '0.5 oz spicy liqueur', '1 oz citrus', 'jalapeño garnish'],
            premium: ['2 oz top-shelf spirit', '0.75 oz premium liqueur', '0.5 oz artisan syrup', 'premium garnish'],
            festive: ['2 oz premium spirit', '1 oz celebration mixer', '0.5 oz sparkling addition', 'festive garnish']
        };

        const ingredients = fallbackIngredients[upgradeType] || fallbackIngredients.seasonal;

        return {
            originalQuery: originalQuery,
            suggestion: `Upgraded ${originalQuery} recipe with ${upgradeType} enhancements`,
            title: `${this.capitalizeUpgradeType(upgradeType)} ${originalQuery}`,
            snippet: `Ingredients: ${ingredients.join(', ')}. Instructions: Combine ingredients with enhanced technique, serve with premium presentation.`,
            why: `${this.capitalizeUpgradeType(upgradeType)} upgrade provides enhanced flavors and presentation`,
            enhancedComment: {
                poeticDescription: `${this.capitalizeUpgradeType(upgradeType)} magic in a glass,\nElevated taste that's built to last.`,
                personalComment: 'Your cocktail game just leveled up!',
                upgradeComment: 'Ready for another transformation?'
            },
            searchType: 'upgrade',
            upgradeType: upgradeType,
            supportsUpgrade: true
        };
    }
}

export default CocktailUpgradeService;
