// shared/constants.ts - Shared between frontend and backend

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
    return FOOD_ITEMS.includes(normalizedQuery);
};

export const isLiquorType = (query: string): boolean => {
    const normalizedQuery = query.toLowerCase().trim();
    return LIQUOR_TYPES.includes(normalizedQuery);
};

export const getSearchType = (query: string): 'food' | 'liquor' | 'cocktail' => {
    if (!query) return 'cocktail';
    
    if (isFoodItem(query)) return 'food';
    if (isLiquorType(query)) return 'liquor';
    return 'cocktail';
};