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

const { fetchAndProcessGeminiResults } = require('./geminiService');

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

// API Endpoint: Get mixologist suggestion
exports.getMixologistSuggestion = functions.https.onCall(async (data, context) => {
  const query = data.query;

  if (!query) {
    throw new functions.https.HttpsError('invalid-argument', 'Query is required');
  }

  try {
    console.log('Processing mixologist query:', query);
    
    const apiKey = functions.config().generativelanguage.key;
    
    if (!apiKey) {
      throw new functions.https.HttpsError('internal', 'Gemini API key not configured');
    }

    // Use the improved geminiService
    const searchResults = await fetchAndProcessGeminiResults(query, apiKey);
    
    console.log('Search results count:', searchResults?.length || 0);

    if (!searchResults || searchResults.length === 0) {
      return {
        originalQuery: query,
        suggestion: `No specific recommendations found for "${query}". Try searching for a classic cocktail, spirit, or food item.`,
        title: 'No Results Found',
        searchType: 'general',
        results: []
      };
    }

    // Return the first result as the main suggestion
    const mainResult = searchResults[0];
    
    return {
      originalQuery: query,
      suggestion: mainResult.snippet || mainResult.title || 'No details available',
      title: mainResult.title || 'Mixologist Recommendation',
      snippet: mainResult.snippet,
      content: mainResult.snippet,
      filePath: mainResult.filePath,
      why: mainResult.why,
      results: searchResults,
      searchType: 'general'
    };

  } catch (error) {
    console.error("Error in getMixologistSuggestion:", error.message);
    
    // Return a fallback response instead of throwing
    return {
      originalQuery: query,
      suggestion: `I encountered an issue processing your request for "${query}". Please try again with a different search term.`,
      title: 'Search Error',
      searchType: 'error',
      results: []
    };
  }
});

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