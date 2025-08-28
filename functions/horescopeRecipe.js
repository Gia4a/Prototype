// Local Recipe System - No Database Required
// All recipes stored in code, planetary modifications applied dynamically

// Base 32 Recipes (embedded in app)
const BASE_RECIPES = {
  fire_new_moon: {
    name: "Whiskey Ginger",
    base_spirit: "whiskey",
    mixer: "ginger_beer",
    instructions: ["Add 2oz whiskey to glass with ice", "Top with ginger beer", "Stir once"],
    theme: "Igniting new beginnings"
  },
  fire_waxing_crescent: {
    name: "Rum & Coke",
    base_spirit: "dark_rum",
    mixer: "cola",
    citrus: "lime_wedge",
    instructions: ["Add 2oz dark rum to glass with ice", "Top with cola", "Squeeze lime wedge and drop in"],
    theme: "Building passionate energy"
  },
  // ... all 32 recipes here (abbreviated for space)
  water_waning_crescent: {
    name: "Lemon Drop",
    base_spirit: "lemon_vodka",
    sweetener: "simple_syrup",
    citrus: "lemon_juice",
    instructions: ["Add 2oz lemon vodka and 0.5oz simple syrup to shaker with ice", "Shake well", "Strain into glass"],
    theme: "Emotional renewal"
  }
};

// Sign Configuration
const SIGNS = {
  aries: { element: 'fire', modality: 'cardinal', ruler: 'mars' },
  taurus: { element: 'earth', modality: 'fixed', ruler: 'venus' },
  gemini: { element: 'air', modality: 'mutable', ruler: 'mercury' },
  cancer: { element: 'water', modality: 'cardinal', ruler: 'moon' },
  leo: { element: 'fire', modality: 'fixed', ruler: 'sun' },
  virgo: { element: 'earth', modality: 'mutable', ruler: 'mercury' },
  libra: { element: 'air', modality: 'cardinal', ruler: 'venus' },
  scorpio: { element: 'water', modality: 'fixed', ruler: 'pluto' },
  sagittarius: { element: 'fire', modality: 'mutable', ruler: 'jupiter' },
  capricorn: { element: 'earth', modality: 'cardinal', ruler: 'saturn' },
  aquarius: { element: 'air', modality: 'fixed', ruler: 'uranus' },
  pisces: { element: 'water', modality: 'mutable', ruler: 'neptune' }
};

// Planetary Modifiers (applied dynamically)
const PLANETARY_MODIFIERS = {
  mars: { spirit_modifier: 'spiced', color: 'red', intensity: 'bold', garnish: 'chili_rim' },
  venus: { spirit_modifier: 'vanilla', color: 'pink', intensity: 'smooth', garnish: 'sugar_rim' },
  mercury: { spirit_modifier: 'citrus', color: 'yellow', intensity: 'bright', garnish: 'lemon_twist' },
  moon: { spirit_modifier: 'coconut', color: 'silver', intensity: 'gentle', garnish: 'sea_salt' },
  sun: { spirit_modifier: 'gold', color: 'gold', intensity: 'radiant', garnish: 'orange_peel' },
  jupiter: { spirit_modifier: 'honey', color: 'amber', intensity: 'expansive', garnish: 'herbs' },
  saturn: { spirit_modifier: 'aged', color: 'brown', intensity: 'structured', garnish: 'none' },
  uranus: { spirit_modifier: 'electric', color: 'blue', intensity: 'innovative', garnish: 'unusual' },
  neptune: { spirit_modifier: 'berry', color: 'ocean_blue', intensity: 'dreamy', garnish: 'edible_flowers' },
  pluto: { spirit_modifier: 'dark', color: 'black', intensity: 'transformative', garnish: 'black_salt' }
};

// Get Recipe for Any Sign/Moon Phase
// Update getRecipe to include a shortened 4-line idiom description
function getRecipe(sign, moonPhase) {
  if (!SIGNS[sign]) {
    throw new Error(`Invalid sign: ${sign}`);
  }

  const signData = SIGNS[sign];
  const baseRecipeKey = `${signData.element}_${moonPhase}`;
  const baseRecipe = BASE_RECIPES[baseRecipeKey];

  if (!baseRecipe) {
    throw new Error(`No recipe found for ${signData.element} ${moonPhase}`);
  }

  const planetaryModifier = PLANETARY_MODIFIERS[signData.ruler];

  return {
    title: `${sign.charAt(0).toUpperCase() + sign.slice(1)} Cosmic Cocktail`,
    subtitle: `${moonPhase.replace('_', ' ')} • ${signData.ruler}`,
    drinkName: `${sign.charAt(0).toUpperCase() + sign.slice(1)}'s ${baseRecipe.name}`,
    description: `${baseRecipe.theme} with ${signData.ruler} influence.\n` +
                 `Spirit style: ${planetaryModifier.spirit_modifier}.\n` +
                 `Color theme: ${planetaryModifier.color}.\n` +
                 `Energy level: ${planetaryModifier.intensity}.`,
    ingredients: [
      `Base: ${planetaryModifier.spirit_modifier}_${baseRecipe.base_spirit}`.replace('_undefined', ''),
      baseRecipe.mixer ? `Mixer: ${baseRecipe.mixer}` : null,
      baseRecipe.citrus ? `Citrus: ${baseRecipe.citrus}` : null,
      baseRecipe.sweetener ? `Sweetener: ${baseRecipe.sweetener}` : null,
      baseRecipe.cream ? `Cream: ${baseRecipe.cream}` : null,
      baseRecipe.seasoning ? `Seasoning: ${baseRecipe.seasoning}` : null
    ].filter(Boolean),
    instructions: baseRecipe.instructions.join(' ')
  };
}

// Get Current Recipe (main function for app)
function getCurrentRecipe(userSign) {
  const currentMoonPhase = getCurrentMoonPhase(); // Your moon phase logic
  return getRecipe(userSign, currentMoonPhase);
}

// In your recipeSystem.js file

function generateDailyMessage(sign, recipe) {
  const { name, base, mixer, citrus, garnish } = recipe.final_recipe;
  const { ruler, element, quality } = SIGNS[sign];

  // The KEY is to add instructions for the AI to format its response as JSON.
  const prompt = `
    Create a cosmic cocktail horoscope for the zodiac sign ${sign}.
    The cocktail is called \"${name}\".
    The ingredients are: ${base}, ${mixer}, ${citrus}, and ${garnish}.
    The sign's ruling planet is ${ruler} and its element is ${element}.

    Analyze these details and generate a creative, insightful, and slightly mystical horoscope message.

    IMPORTANT: Respond ONLY with a valid JSON object. Do not include any text before or after the JSON object.

    The JSON object must have the following structure:
    {
      "insight": "A concise astrological insight for the user based on the sign, planet, and cocktail theme. This should be formatted as a 4-line idiom. Do not include any additional sentences or explanations.",
      "theme": "A short, catchy theme or motto for the day, like 'Quiet reflection with mercury influence'.",
      "instructions": "Simple, clear instructions to make the cocktail."
    }
  `;
  return prompt;
}

// All Moon Phases
const MOON_PHASES = [
  'new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
  'full_moon', 'waning_gibbous', 'third_quarter', 'waning_crescent'
];

// Get All Recipes for a Sign (8 recipes per sign)
function getAllRecipesForSign(sign) {
  return MOON_PHASES.map(phase => getRecipe(sign, phase));
}

// Update getCurrentMoonPhase to align with Horoscope.tsx
function getCurrentMoonPhase() {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const phaseIndex = Math.floor((dayOfMonth / 30) * 8) % 8;
  return MOON_PHASES[phaseIndex];
}

// Example Usage Functions
function displayRecipe(recipe) {
  console.log(`🌟 ${recipe.final_recipe.name}`);
  console.log(`Element: ${recipe.element} | Planet: ${recipe.planetary_ruler}`);
  console.log(`Theme: ${recipe.final_recipe.theme}`);
  console.log('\nIngredients:');
  console.log(`- ${recipe.final_recipe.base_spirit}`);
  if (recipe.base_recipe.mixer) console.log(`- ${recipe.final_recipe.mixer}`);
  if (recipe.base_recipe.citrus) console.log(`- ${recipe.final_recipe.citrus}`);
  console.log('\nInstructions:');
  recipe.final_recipe.instructions.forEach((step, i) => {
    console.log(`${i + 1}. ${step}`);
  });
  console.log(`\n✨ ${recipe.final_recipe.astrological_note}`);
}

// Get Recipe Statistics
function getStats() {
  const totalCombinations = Object.keys(SIGNS).length * MOON_PHASES.length;
  const baseRecipes = Object.keys(BASE_RECIPES).length;
  
  return {
    total_combinations: totalCombinations, // 96
    base_recipes_stored: baseRecipes, // 32
    signs: Object.keys(SIGNS).length, // 12
    moon_phases: MOON_PHASES.length, // 8
    storage_efficiency: `${baseRecipes} recipes generate ${totalCombinations} combinations`
  };
}

// Replace existing exports with updated functions
module.exports = {
  getRecipe,
  getCurrentRecipe,
  getAllRecipesForSign,
  generateDailyMessage,
  displayRecipe,
  getStats,
  BASE_RECIPES,
  SIGNS,
  PLANETARY_MODIFIERS,
  getCurrentMoonPhase
};

// Example usage:
// const recipe = getCurrentRecipe('aries');
// displayRecipe(recipe);
// const stats = getStats(); // Shows 32 recipes → 96 combinations