// functions/index.js - Firebase Functions API
const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const axios = require('axios');

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
} = require('./horescopeRecipe');

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
    const recipe = getRecipe(sign, moonPhase); // You already have the recipe data
    const prompt = generateDailyMessage(sign, recipe); // This now asks for JSON
    
    // Call Gemini API here
    const geminiResponseString = await callGeminiAPI(prompt); // This is now a JSON string
    
    // --- START OF CHANGES ---

    // 1. Parse the JSON string from Gemini
    const parsedGeminiData = JSON.parse(geminiResponseString);

    // 2. Combine your local recipe data with the AI-generated text
    const finalResponseObject = {
        sign: sign,
        cocktailName: recipe.final_recipe.name,
        moonPhase: moonPhase,
        ruler: SIGNS[sign].ruler,
        element: SIGNS[sign].element,
        ingredients: [
            recipe.final_recipe.base,
            recipe.final_recipe.mixer,
            recipe.final_recipe.citrus,
            recipe.final_recipe.garnish
        ].filter(Boolean), // .filter(Boolean) removes any null/empty ingredients
        
        // Use the parsed data from Gemini
        instructions: parsedGeminiData.instructions,
        theme: parsedGeminiData.theme,
        insight: parsedGeminiData.insight
    };

    // 3. Return the complete, structured object
    return finalResponseObject;

    // --- END OF CHANGES ---

  } catch (error) {
    console.error("Error in getDailyMessage:", error);
    // Add more descriptive error logging
    throw new functions.https.HttpsError('internal', 'Failed to generate and parse daily message.', error.message);
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

// Gemini API integration
async function callGeminiAPI(prompt) {
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      { prompt },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error calling Gemini API:', error.response || error.message);
    throw error;
  }
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

// API Endpoint: Get mixologist suggestion
exports.getMixologistSuggestion = functions.https.onCall(async (data, context) => {
  const query = data.query;

  if (!query) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a query.');
  }

  // Example logic for generating a mixologist suggestion
  const suggestion = `Based on your query '${query}', we suggest trying a classic Mojito!`;

  return {
    originalQuery: query,
    mixologistSuggestion: suggestion
  };
});