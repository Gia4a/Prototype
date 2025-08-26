// functions/index.js - Firebase Functions API
const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });

// Import your recipe system
const { 
  getRecipe, 
  getCurrentRecipe, 
  getAllRecipesForSign, 
  generateDailyMessage,
  getStats,
  BASE_RECIPES,
  SIGNS,
  PLANETARY_MODIFIERS 
} = require('./recipeSystem');

// API Endpoint: Get specific recipe
exports.getRecipe = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const { sign, moonPhase } = req.query;
    
    if (!sign || !moonPhase) {
      return res.status(400).json({
        error: 'Missing required parameters: sign and moonPhase'
      });
    }
    
    const recipe = getRecipe(sign, moonPhase);
    
    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found'
      });
    }
    
    res.json({
      success: true,
      data: recipe
    });
  });
});

// API Endpoint: Get current recipe for user's sign
exports.getCurrentRecipe = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const { sign } = req.query;
    
    if (!sign) {
      return res.status(400).json({
        error: 'Missing required parameter: sign'
      });
    }
    
    const recipe = getCurrentRecipe(sign);
    
    res.json({
      success: true,
      data: recipe,
      current_moon_phase: getCurrentMoonPhase()
    });
  });
});

// API Endpoint: Get all recipes for a sign (8 moon phases)
exports.getAllRecipesForSign = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const { sign } = req.query;
    
    if (!sign) {
      return res.status(400).json({
        error: 'Missing required parameter: sign'
      });
    }
    
    const recipes = getAllRecipesForSign(sign);
    
    res.json({
      success: true,
      data: recipes,
      total_recipes: recipes.length
    });
  });
});

// API Endpoint: Generate daily message using Gemini
exports.getDailyMessage = functions.https.onCall(async (data, context) => {
  const { sign, moonPhase } = data;
  
  if (!sign || !moonPhase) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing sign or moonPhase');
  }
  
  try {
    const recipe = getRecipe(sign, moonPhase);
    const prompt = generateDailyMessage(sign, recipe);
    
    // Call Gemini API here
    const geminiResponse = await callGeminiAPI(prompt);
    
    return {
      success: true,
      message: geminiResponse,
      recipe_name: recipe.final_recipe.name,
      sign: sign,
      moon_phase: moonPhase
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Failed to generate message');
  }
});

// API Endpoint: Get system stats
exports.getStats = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const stats = getStats();
    
    res.json({
      success: true,
      data: stats,
      available_signs: Object.keys(SIGNS),
      moon_phases: [
        'new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
        'full_moon', 'waning_gibbous', 'third_quarter', 'waning_crescent'
      ]
    });
  });
});

// API Endpoint: Get all base recipes (for debugging)
exports.getAllBaseRecipes = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    res.json({
      success: true,
      data: BASE_RECIPES,
      total_base_recipes: Object.keys(BASE_RECIPES).length
    });
  });
});

// Helper function for current moon phase
function getCurrentMoonPhase() {
  // Replace with real moon phase API or calculation
  const phases = [
    'new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
    'full_moon', 'waning_gibbous', 'third_quarter', 'waning_crescent'
  ];
  const now = new Date();
  const dayOfMonth = now.getDate();
  const phaseIndex = Math.floor((dayOfMonth / 30) * 8) % 8;
  return phases[phaseIndex];
}

// Gemini API integration (placeholder)
async function callGeminiAPI(prompt) {
  // Your Gemini API call here
  // const response = await gemini.generateContent(prompt);
  // return response.text;
  
  return "Today's cosmic energies align perfectly with this cocktail choice!";
}

// Batch function for multiple signs
exports.getBatchRecipes = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const { signs, moonPhase } = req.body;
    
    if (!signs || !Array.isArray(signs) || !moonPhase) {
      return res.status(400).json({
        error: 'Missing required parameters: signs (array) and moonPhase'
      });
    }
    
    const recipes = {};
    signs.forEach(sign => {
      recipes[sign] = getRecipe(sign, moonPhase);
    });
    
    res.json({
      success: true,
      data: recipes,
      moon_phase: moonPhase,
      processed_signs: signs.length
    });
  });
});