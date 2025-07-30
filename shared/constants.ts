// shared/constants.ts - Shared between frontend and backend

// Flavored Liquors (for special handling - shooters)
export const FLAVORED_LIQUORS = [
    'crown peach', 'smirnoff peach', 'fireball', 'crown apple',
    'smirnoff vanilla', 'absolut citron', 'grey goose cherry noir',
    'baileys', 'kahlua', 'sambuca', 'hypnotiq', 'goldschlager',
    'malibu coconut', 'captain morgan spiced', 'bacardi vanilla',
    // ... add more flavored spirits as needed
];

export const FOOD_ITEMS = [
    // Meats
    "steak", "rib", "ribs", "chicken", "pork", "beef", "lamb", "duck", "brisket", 
    "bacon", "filet mignon", "ribeye", "sirloin", "prime rib",
    
    // Seafood
    "salmon", "tuna", "shrimp", "lobster", "crab", "oysters", "scallops", "fish",
    
    // Ethnic Foods
    "pho", "butter chicken", "curry", "sushi", "tacos", "paella", "pasta", 
    "ramen", "tikka masala", "pad thai", "biryani", "risotto", "enchiladas",
    
    // Sides/Vegetables
    "potatoes", "asparagus", "brussels sprouts", "mushrooms", "broccoli", "carrots",
    "corn", "spinach", "kale", "zucchini", "eggplant", "cauliflower",
    
    // Desserts
    "chocolate", "cheesecake", "tiramisu", "ice cream", "cake", "pie", "cookies",
    "brownies", "pudding", "custard", "tart", "pastry", "donut", "éclair",
    
    // Common Foods
    "burger", "pizza", "burrito", "soup", "salad", "sandwich", "rice", "noodles", 
    "bread", "vegetable", "fruit", "cheese",

    // Cuisines
    "mexican", "italian", "japanese", "chinese", "indian", "thai", "french",

    // Meal types
    "breakfast", "lunch", "dinner", "appetizer", "dessert", "snack"
];

export const LIQUOR_TYPES = [
    // Western Spirits
    "vodka", "rum", "gin", "tequila", "whiskey", "scotch", "bourbon", 
    "brandy", "cognac", "mezcal", "vermouth", "amaro", "liqueur",
    // Sparkling Wines
    "prosecco",
    
    // Whisky/Whiskey Categories
    "irish whiskey", "canadian whisky", "japanese whisky", "rye whiskey",
    "blended whisky", "single malt", "tennessee whiskey",
    
    // Asian Spirits
    "sake", "soju", "shochu", "baijiu", "umeshu", "makgeolli",
    
    // Other International Spirits
    "cachaca", "pisco", "grappa", "aquavit", "absinthe", "ouzo", "raki",
    "sambuca", "calvados", "eau de vie", "armagnac", "fernet",
    
    // Fortified Wines
    "port", "sherry", "madeira", "marsala", "vermouth",
    
    // Specialty Liqueurs
    "amaretto", "baileys", "triple sec", "cointreau", "chambord", "chartreuse",
    "drambuie", "frangelico", "grand marnier", "kahlua", "midori", "limoncello",
    "st germain", "campari", "aperol",
    
    // Flavored Spirits
    "flavored vodka", "spiced rum", "flavored gin", "infused tequila",
    
    // Cream Liqueurs
    "irish cream", "rum cream", "crème liqueur",
    
    // Ready-to-Drink
    "premixed cocktail", "canned cocktail", "hard seltzer", "cooler",
    
    // Other Categories
    "bitters", "aperitif", "digestif", "schnapps", "curacao", "cordial"
];

// Helper functions that can be used by both frontend and backend
export const isFoodItem = (query: string): boolean => {
    const normalizedQuery = query.toLowerCase().trim();
    return FOOD_ITEMS.some(item => normalizedQuery.includes(item.toLowerCase()));
};

export const isLiquorType = (query: string): boolean => {
    const normalizedQuery = query.toLowerCase().trim();
    return LIQUOR_TYPES.some(liquor => normalizedQuery.includes(liquor.toLowerCase()));
};

export const isFlavoredLiquor = (query: string): boolean => {
    const normalized = query.toLowerCase().trim();
    
    // First check the explicit list
    const isInList = FLAVORED_LIQUORS.some(liquor => 
        normalized.includes(liquor.toLowerCase())
    );
    
    // If not in list, check patterns for broader coverage
    if (!isInList) {
        const flavoredPatterns = [
            // Brand + flavor combinations
            /\b(crown|smirnoff|absolut|grey goose|captain morgan|jose cuervo|jack daniels|jim beam|jameson|bacardi|malibu)\s+(peach|apple|vanilla|cherry|cinnamon|coconut|lime|citrus|raspberry|strawberry|blueberry|watermelon|pineapple|mango|honey|caramel|banana|orange)/i,
            
            // Specific well-known flavored spirits
            /\b(fireball|goldschlager|sambuca|hypnotiq|hpnotiq)\b/i,
            
            // Flavor + base spirit combinations
            /\b(peach|apple|vanilla|cherry|cinnamon|coconut|raspberry|strawberry|blueberry|watermelon|pineapple|mango|honey|caramel|banana|orange)\s+(vodka|whiskey|whisky|rum|tequila|gin|schnapps)/i,
            
            // Cream liqueurs
            /\b(baileys|kahlua|amaretto|frangelico|sambuca)\b/i,
            
            // Flavored rums
            /\b(captain morgan|bacardi|malibu)\s+(spiced|coconut|vanilla|cherry|pineapple)/i,
            
            // Flavored vodkas
            /\b(absolut|smirnoff|grey goose|titos|pinnacle)\s+(citron|vanilla|cherry|raspberry|peach|apple|coconut)/i
        ];
        
        return flavoredPatterns.some(pattern => pattern.test(normalized));
    }
    
    return isInList;
};

// NEW: Shooter detection function
export const isShooterQuery = (query: string): boolean => {
    return /\b\w+\s+(shooter|shot)\b/i.test(query) || /\b(shooter|shot)\s+\w+\b/i.test(query);
};

// Updated getSearchType function with shooter detection
export const getSearchType = (query: string): 'food' | 'liquor' | 'flavored_liquor' | 'cocktail' => {
    if (!query) return 'cocktail';
    
    // IMPORTANT: Check in this specific order!
    
    // 1. Check food first (most specific)
    if (isFoodItem(query)) {
        return 'food';
    }
    
    // 2. Check shooter queries BEFORE flavored liquor (to prioritize shooter detection)
    if (isShooterQuery(query)) {
        return 'flavored_liquor'; // Use same handling as flavored liquor
    }
    
    // 3. Check flavored liquor BEFORE general liquor (more specific than general liquor)
    if (isFlavoredLiquor(query)) {
        return 'flavored_liquor';
    }
    
    // 4. Check general liquor types (less specific than flavored)
    if (isLiquorType(query)) {
        return 'liquor';
    }
    
    // 5. Fallback to cocktail for everything else
    return 'cocktail';
};