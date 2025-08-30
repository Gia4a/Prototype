// functions/index.js - Firebase Functions API
const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

admin.initializeApp();

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

// --- Enhanced mixologist and upgrade endpoints ---
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/v2/params');
const { fetchAndProcessGeminiResults, generateCocktailComment, generateSeasonalUpgrade } = require('./geminiService');
const { extractBestRecipe } = require('./cocktail');
const { isFoodItem, isLiquorType, isFlavoredLiquor } = require('./constants');

// Define the secret for Gemini API key
const geminiApiKey = defineSecret('GEMINI_API_KEY');

// Helper function to clean and parse JSON from Gemini responses
function cleanAndParseGeminiJSON(responseText) {
    if (!responseText) {
        throw new Error('Empty response from Gemini');
    }

    console.log("Original Gemini response:", responseText);

    try {
        // Remove markdown code blocks
        let cleaned = responseText.replace(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/g, '$1');
        
        // Find JSON object boundaries
        const startIdx = cleaned.search(/[{\[]/);
        const isArray = cleaned.charAt(startIdx) === '[';
        const endChar = isArray ? ']' : '}';
        const endIdx = cleaned.lastIndexOf(endChar);
        
        if (startIdx === -1 || endIdx === -1) {
            throw new Error('No valid JSON found in response');
        }

        cleaned = cleaned.substring(startIdx, endIdx + 1).trim();
        
        // Basic JSON cleanup
        cleaned = cleaned
            .replace(/,\s*([}\]])/g, '$1')  // Remove trailing commas
            .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');  // Quote keys

        console.log("Cleaned JSON:", cleaned);
        
        return JSON.parse(cleaned);
        
    } catch (error) {
        console.error("JSON parsing failed:", error.message);
        console.error("Failed to parse:", responseText);
        
        // Return fallback structure
        return {
            fourLineIdiom: "The stars align in mysterious ways, bringing wisdom through liquid inspiration.",
            dailyTheme: "Cosmic Guidance",
            planetaryAlignments: "Current planetary energies support reflection and discovery.",
            moonPhase: "waxing_crescent"
        };
    }
}

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
exports.getAllRecipesForSign = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    console.log("Request received for getAllRecipesForSign!");

    if (request.method !== 'POST') {
      return response.status(405).send('Method Not Allowed');
    }

    try {
      const { sign, displayName, date } = request.body;
      console.log("Received data:", request.body);

      const geminiPrompt = `
        Provide astrological information for zodiac sign "${sign}" on date "${new Date(date).toDateString()}".
        Return ONLY a JSON object with this exact structure:
        {
          "moonPhase": "waxing_crescent",
          "fourLineIdiom": "A four-line mystical verse about today's cosmic energies",
          "dailyTheme": "Brief theme for the day",
          "planetaryAlignments": "Description of current planetary influences"
        }
      `;

      console.log("Sending prompt to Gemini:", geminiPrompt);
      const geminiResponseText = await callGeminiAPI(geminiPrompt);
      const astrologyData = cleanAndParseGeminiJSON(geminiResponseText);
      
      console.log("Parsed Gemini data:", astrologyData);

      response.status(200).json({
        success: true,
        moonPhase: astrologyData.moonPhase || 'current_phase',
        fourLineIdiom: astrologyData.fourLineIdiom || 'The cosmos whispers ancient wisdom.',
        dailyTheme: astrologyData.dailyTheme || 'Cosmic Reflection',
        planetaryAlignments: astrologyData.planetaryAlignments || 'Harmonious celestial energies.',
      });

    } catch (error) {
      console.error("Error in getAllRecipesForSign:", error.message);
      response.status(500).json({
        success: false,
        error: "Failed to get astrological insights.",
        details: error.message
      });
    }
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
    
    const geminiResponseString = await callGeminiAPI(prompt);
    const parsedGeminiData = cleanAndParseGeminiJSON(geminiResponseString);

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
        ].filter(Boolean),
        
        instructions: parsedGeminiData.instructions || 'Mix with intention',
        theme: parsedGeminiData.theme || 'Cosmic Balance',
        insight: parsedGeminiData.insight || 'A mystical cocktail experience awaits.'
    };

    return finalResponseObject;

  } catch (error) {
    console.error("Error in getDailyMessage:", error);
    throw new functions.https.HttpsError('internal', 'Failed to generate daily message.', error.message);
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
  const phases = [
    'new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
    'full_moon', 'waning_gibbous', 'third_quarter', 'waning_crescent'
  ];
  const now = new Date();
  const dayOfMonth = now.getDate();
  const phaseIndex = Math.floor((dayOfMonth / 30) * 8) % 8;
  return phases[phaseIndex];
}

// Improved Gemini API integration
async function callGeminiAPI(prompt) {
  try {
    const apiKey = functions.config().generativelanguage.key;

    if (!apiKey) {
      throw new Error('Generative Language API Key not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        topK: 10,
        topP: 0.8,
        maxOutputTokens: 1024
      }
    });

    const response = await result.response;
    if (response && response.candidates && response.candidates.length > 0) {
      return response.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Gemini response was empty or malformed.");
    }

  } catch (error) {
    console.error("Gemini API error:", error.message);
    throw error;
  }
}


// Enhanced mixologist function with comment generation
exports.getMixologistSuggestion = onCall(
  { secrets: [geminiApiKey] },
  async (request) => {
    const { query } = request.data;

    if (!query || typeof query !== 'string') {
      throw new HttpsError('invalid-argument', 'Query is required and must be a string');
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      throw new HttpsError('invalid-argument', 'Query cannot be empty');
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError('internal', 'Gemini API key is not configured');
    }

    try {
      console.log(`Processing enhanced query: "${trimmedQuery}"`);

      // Get the basic cocktail results
      const results = await fetchAndProcessGeminiResults(trimmedQuery, apiKey);
            
      if (!results || results.length === 0) {
        throw new HttpsError('not-found', 'No results found for the given query');
      }

      const primaryResult = results[0];
            
      // Check if this is a cocktail/liquor query that should get enhanced comments
      const isEnhanceable = (isLiquorType(trimmedQuery) || 
                 trimmedQuery.toLowerCase().includes('cocktail') ||
                 trimmedQuery.toLowerCase().includes('drink')) &&
                !trimmedQuery.toLowerCase().includes('horoscope');

      if (isEnhanceable && primaryResult.snippet) {
        try {
          // Extract ingredients for comment generation
          const ingredientsText = primaryResult.snippet.match(/Ingredients:\s*([\s\S]*?)(?=\s*Instructions?:|$)/i);
          const ingredients = ingredientsText ? 
            ingredientsText[1].split(/[\,\n]/).map(i => i.trim()).filter(i => i.length > 0) : 
            ['premium spirits', 'quality mixers'];

          // Generate enhanced comment
          const enhancedComment = await generateCocktailComment(
            primaryResult.title,
            ingredients,
            null, // Let function determine current season
            apiKey
          );

          // Add enhanced comment to the result
          primaryResult.enhancedComment = enhancedComment;
          primaryResult.supportsUpgrade = true;
                    
        } catch (commentError) {
          console.warn('Could not generate enhanced comment:', commentError.message);
          // Continue with basic result
        }
      }

      return {
        originalQuery: trimmedQuery,
        suggestion: primaryResult.snippet || primaryResult.content || 'No specific recommendation available.',
        title: primaryResult.title || 'Mixologist Recommendation',
        filePath: primaryResult.filePath || null,
        results: results,
        searchType: 'cocktail_suggestion',
        snippet: primaryResult.snippet,
        why: primaryResult.why || 'Expert mixologist recommendation',
        enhancedComment: primaryResult.enhancedComment || null,
        supportsUpgrade: primaryResult.supportsUpgrade || false
      };

    } catch (error) {
      console.error('Error in getMixologistSuggestion:', error);
            
      if (error instanceof HttpsError) {
        throw error;
      }
            
      throw new HttpsError('internal', `Failed to process mixologist request: ${error.message}`);
    }
  }
);

// New function for handling upgrade requests
exports.getUpgradedCocktail = onCall(
  { secrets: [geminiApiKey] },
  async (request) => {
    const { originalQuery, upgradeType } = request.data;

    if (!originalQuery || typeof originalQuery !== 'string') {
      throw new HttpsError('invalid-argument', 'Original query is required');
    }

    if (!upgradeType || typeof upgradeType !== 'string') {
      throw new HttpsError('invalid-argument', 'Upgrade type is required');
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError('internal', 'Gemini API key is not configured');
    }

    try {
      console.log(`Processing upgrade request: "${originalQuery}" -> ${upgradeType}`);

      // Generate the seasonal/upgraded version
      const upgradeResult = await generateSeasonalUpgrade(
        originalQuery,
        upgradeType,
        null, // Let function determine current season
        apiKey
      );

      if (!upgradeResult) {
        throw new HttpsError('internal', 'Could not generate upgrade recipe');
      }

      // Generate enhanced comment for the upgrade
      let enhancedComment = null;
      try {
        const ingredientsText = upgradeResult.snippet.match(/Ingredients:\s*([\s\S]*?)(?=\s*Instructions?:|$)/i);
        const ingredients = ingredientsText ? 
          ingredientsText[1].split(/[\,\n]/).map(i => i.trim()).filter(i => i.length > 0) : 
          ['premium spirits', 'seasonal ingredients'];

        enhancedComment = await generateCocktailComment(
          upgradeResult.title,
          ingredients,
          null,
          apiKey
        );
      } catch (commentError) {
        console.warn('Could not generate upgrade comment:', commentError.message);
      }

      return {
        originalQuery: originalQuery,
        suggestion: upgradeResult.snippet,
        title: upgradeResult.title,
        filePath: upgradeResult.filePath,
        searchType: 'cocktail_upgrade',
        snippet: upgradeResult.snippet,
        why: upgradeResult.why,
        upgradeType: upgradeType,
        enhancedComment: enhancedComment,
        supportsUpgrade: true // Upgrades can be further upgraded
      };

    } catch (error) {
      console.error('Error in getUpgradedCocktail:', error);
            
      if (error instanceof HttpsError) {
        throw error;
      }
            
      throw new HttpsError('internal', `Failed to process upgrade request: ${error.message}`);
    }
  }
);

// Optional: Function to get just enhanced comment for existing recipes
exports.getEnhancedComment = onCall(
  { secrets: [geminiApiKey] },
  async (request) => {
    const { cocktailName, ingredients } = request.data;

    if (!cocktailName || typeof cocktailName !== 'string') {
      throw new HttpsError('invalid-argument', 'Cocktail name is required');
    }

    if (!ingredients || !Array.isArray(ingredients)) {
      throw new HttpsError('invalid-argument', 'Ingredients array is required');
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError('internal', 'Gemini API key is not configured');
    }

    try {
      const enhancedComment = await generateCocktailComment(
        cocktailName,
        ingredients,
        null,
        apiKey
      );

      return {
        enhancedComment: enhancedComment,
        success: true
      };

    } catch (error) {
      console.error('Error generating enhanced comment:', error);
      throw new HttpsError('internal', `Failed to generate comment: ${error.message}`);
    }
  }
);

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