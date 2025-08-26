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
function getRecipe(sign, moonPhase) {
  const signData = SIGNS[sign];
  const element = signData.element;
  const planet = signData.ruler;
  
  // Get base recipe
  const baseRecipeKey = `${element}_${moonPhase}`;
  const baseRecipe = BASE_RECIPES[baseRecipeKey];
  
  if (!baseRecipe) {
    return null;
  }
  
  // Apply planetary modifier
  const modifier = PLANETARY_MODIFIERS[planet];
  
  return {
    sign: sign,
    element: element,
    moon_phase: moonPhase,
    planetary_ruler: planet,
    base_recipe: baseRecipe,
    modifications: {
      spirit_style: modifier.spirit_modifier,
      color_theme: modifier.color,
      intensity: modifier.intensity,
      suggested_garnish: modifier.garnish,
      personalized_name: `${sign.charAt(0).toUpperCase() + sign.slice(1)}'s ${baseRecipe.name}`
    },
    final_recipe: {
      name: `${sign.charAt(0).toUpperCase() + sign.slice(1)}'s ${baseRecipe.name}`,
      base_spirit: `${modifier.spirit_modifier}_${baseRecipe.base_spirit}`.replace('_undefined', ''),
      mixer: baseRecipe.mixer,
      instructions: baseRecipe.instructions,
      theme: `${baseRecipe.theme} with ${planet} influence`,
      astrological_note: `Perfect for ${sign} during ${moonPhase.replace('_', ' ')}`
    }
  };
}

// Get Current Recipe (main function for app)
function getCurrentRecipe(userSign) {
  const currentMoonPhase = getCurrentMoonPhase(); // Your moon phase logic
  return getRecipe(userSign, currentMoonPhase);
}

// Generate Daily Message (for Gemini AI)
function generateDailyMessage(sign, recipe) {
  const signData = SIGNS[sign];
  const planet = signData.ruler;
  
  const prompt = `Write a 2-3 sentence daily horoscope message for ${sign} about why "${recipe.final_recipe.name}" is perfect for them today. 
  Mention ${planet}'s influence and the current moon phase energy. Keep it mystical but friendly.`;
  
  return prompt; // Send this to Gemini API
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

// Mock Moon Phase Function (replace with real API)
function getCurrentMoonPhase() {
  const phases = MOON_PHASES;
  const now = new Date();
  const dayOfMonth = now.getDate();
  const phaseIndex = Math.floor((dayOfMonth / 30) * 8) % 8;
  return phases[phaseIndex];
}

// Example Usage Functions
function displayRecipe(recipe) {
  console.log(`🌟 ${recipe.final_recipe.name}`);
  console.log(`Element: ${recipe.element} | Planet: ${recipe.planetary_ruler}`);
  console.log(`Theme: ${recipe.final_recipe.theme}`);
  console.log('\nIngredients:');
  console.log(`- ${recipe.final_recipe.base_spirit}`);
  if (recipe.base_recipe.mixer) console.log(`- ${recipe.final_recipe.mixer}`);
  if (recipe.base_recipe.citrus) console.log(`- ${recipe.base_recipe.citrus}`);
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

// Export for use in app
export {
  getRecipe,
  getCurrentRecipe,
  getAllRecipesForSign,
  generateDailyMessage,
  displayRecipe,
  getStats,
  BASE_RECIPES,
  SIGNS,
  PLANETARY_MODIFIERS
};

// Example usage:
// const recipe = getCurrentRecipe('aries');
// displayRecipe(recipe);
// const stats = getStats(); // Shows 32 recipes → 96 combinations