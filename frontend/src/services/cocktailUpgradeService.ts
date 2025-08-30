// cocktailUpgradeService.ts - Lightweight frontend upgrade service
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
  constructor() {
    // No parameters needed
  }

  // Only call the backend for upgrades and return the backend's response
  async getUpgradedCocktail(originalQuery: string, upgradeType: UpgradeType): Promise<UpgradeResponse> {
    // You may want to adjust the endpoint and payload as needed
    const response = await fetch(`/api/upgrade-cocktail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalQuery, upgradeType })
    });
    if (!response.ok) {
      throw new Error('Failed to fetch upgraded cocktail');
    }
    return await response.json();
  }
}

export default CocktailUpgradeService;
