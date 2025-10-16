// functions/index.js - Firebase Functions API
const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { HttpsError } = require("firebase-functions/v1/https");

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

// Import camera/image recognition functions
const { 
  detectLiquorFromImage, 
  getRecipesFromLiquor, 
  getRecipesFromImage, 
  getShooterFromImage 
} = require('./shooters');

// Import enhanced mixologist and upgrade endpoints - REMOVED for speech modal approach
// const { fetchAndProcessGeminiResults, generateCocktailComment, generateSeasonalUpgrade } = require('./geminiservice');
// const { extractBestRecipe } = require('./cocktail');
// const { isFoodItem, isLiquorType, isFlavoredLiquor } = require('./constants');

// Helper function to clean and parse JSON from Gemini responses
function cleanAndParseGeminiJSON(responseText) {
    if (!responseText) {
        throw new Error('Empty response from Gemini');
    }

    // Remove debug logging for production
    // console.log("Original Gemini response:", responseText);

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

        // console.log("Cleaned JSON:", cleaned);
        
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

// ================== CAMERA/IMAGE RECOGNITION ENDPOINTS ==================

// API Endpoint: Process image to get both shooter and cocktail recipes
exports.getRecipesFromCameraImage = functions.https.onCall(
  async (data, context) => {
    const { imageData } = data;

    if (!imageData || typeof imageData !== 'string') {
      throw new HttpsError('invalid-argument', 'Image data is required and must be a base64 string');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError('internal', 'Gemini API key is not configured');
    }

    try {
      // Processing camera image for liquor recognition and recipe generation

      const result = await getRecipesFromImage(imageData, apiKey);

      if (!result.success) {
        throw new HttpsError('not-found', result.error || 'Could not process image');
      }

      return {
        success: true,
        detectedLiquor: result.detectedLiquor,
        shooter: result.shooter,
        cocktail: result.cocktail,
        message: `Detected ${result.detectedLiquor} and generated both shooter and cocktail recipes!`
      };

    } catch (error) {
      console.error('Error in getRecipesFromCameraImage:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', `Failed to process camera image: ${error.message}`);
    }
  }
);

// API Endpoint: Legacy shooter-only function (for backward compatibility)
exports.getShooterFromCameraImage = functions.https.onCall(
  async (data, context) => {
    const { imageData } = data;

    if (!imageData || typeof imageData !== 'string') {
      throw new HttpsError('invalid-argument', 'Image data is required and must be a base64 string');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError('internal', 'Gemini API key is not configured');
    }

    try {
      console.log('Processing camera image for shooter recipe (legacy function)...');

      const result = await getShooterFromImage(imageData, apiKey);

      if (!result.success) {
        throw new HttpsError('not-found', result.error || 'Could not process image');
      }

      return {
        success: true,
        detectedLiquor: result.detectedLiquor,
        recipe: result.recipe,
        message: `Detected ${result.detectedLiquor} and generated shooter recipe!`
      };

    } catch (error) {
      console.error('Error in getShooterFromCameraImage:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', `Failed to process camera image: ${error.message}`);
    }
  }
);

// API Endpoint: Just detect liquor from image (no recipe generation)
exports.detectLiquorFromCameraImage = functions.https.onCall(
  async (data, context) => {
    const { imageData } = data;

    if (!imageData || typeof imageData !== 'string') {
      throw new HttpsError('invalid-argument', 'Image data is required and must be a base64 string');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError('internal', 'Gemini API key is not configured');
    }

    try {
      console.log('Detecting liquor from camera image...');

      const result = await detectLiquorFromImage(imageData, apiKey);

      if (!result.success) {
        throw new HttpsError('not-found', result.error || 'Could not detect liquor in image');
      }

      return {
        success: true,
        detectedLiquor: result.detectedLiquor,
        confidence: result.confidence,
        message: `Successfully detected: ${result.detectedLiquor}`
      };

    } catch (error) {
      console.error('Error in detectLiquorFromCameraImage:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', `Failed to detect liquor from image: ${error.message}`);
    }
  }
);

// API Endpoint: Generate recipes from known liquor name
exports.getRecipesFromLiquorName = functions.https.onCall(
  async (data, context) => {
    const { liquorName } = data;

    if (!liquorName || typeof liquorName !== 'string') {
      throw new HttpsError('invalid-argument', 'Liquor name is required and must be a string');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError('internal', 'Gemini API key is not configured');
    }

    try {
      console.log(`Generating recipes for liquor: ${liquorName}`);

      const recipes = await getRecipesFromLiquor(liquorName, apiKey);

      if (!recipes.shooter && !recipes.cocktail) {
        throw new HttpsError('internal', 'Could not generate recipes');
      }

      return {
        success: true,
        liquorName: liquorName,
        shooter: recipes.shooter,
        cocktail: recipes.cocktail,
        message: `Generated both shooter and cocktail recipes for ${liquorName}!`
      };

    } catch (error) {
      console.error('Error in getRecipesFromLiquorName:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', `Failed to generate recipes: ${error.message}`);
    }
  }
);

// ================== EXISTING HOROSCOPE ENDPOINTS ==================

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

// Text search functionality removed - using speech modal instead

// Upgrade and enhanced comment functions removed - using speech modal instead

// ================== SPEECH-TO-COCKTAIL CONVERSATIONAL AI ==================

// Speech-based cocktail assistant using Gemini for natural conversation
exports.getCocktailFromSpeech = functions.https.onCall(
  async (data, context) => {
    const { speechText, conversationHistory } = data;

    if (!speechText || typeof speechText !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'Speech text is required');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new functions.https.HttpsError('internal', 'Gemini API key is not configured');
    }

    try {
      console.log(`Processing speech input: "${speechText}"`);

      // Build conversation context
      let conversationContext = '';
      if (conversationHistory && Array.isArray(conversationHistory)) {
        conversationContext = conversationHistory.map(msg => 
          `${msg.role}: ${msg.content}`
        ).join('\n');
      }

      // Create a conversational prompt for Gemini
      const prompt = `You are an expert bartender and mixologist having a friendly conversation with a customer. 
      
${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}

Customer just said: "${speechText}"

Respond naturally as a knowledgeable bartender would. If they're asking about cocktails, ingredients, or what to make, provide specific recommendations with recipes. If they're just chatting, respond conversationally but try to guide them toward cocktail recommendations.

For cocktail recommendations, always include:
1. The cocktail name
2. A brief description of taste/style
3. Complete ingredient list with measurements
4. Step-by-step instructions
5. Any tips or variations

Keep your response conversational, friendly, and under 300 words. If they ask about multiple things, focus on one main recommendation.

Format your response as natural speech that could be read aloud, avoiding complex formatting.`;

      // Call Gemini API
      const response = await callGeminiAPI(prompt);
      
      if (!response || !response.trim()) {
        throw new Error('Empty response from Gemini');
      }

      // Extract any cocktail recipe if mentioned
      let detectedCocktail = null;
      if (response.toLowerCase().includes('ingredients:') || 
          response.toLowerCase().includes('recipe:') ||
          response.toLowerCase().includes('oz') || 
          response.toLowerCase().includes('ml')) {
        
        // Try to extract a structured recipe
        detectedCocktail = extractCocktailFromResponse(response);
      }

      return {
        success: true,
        response: response,
        cocktailRecommendation: detectedCocktail,
        conversational: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error in getCocktailFromSpeech:', error);
      throw new functions.https.HttpsError('internal', `Failed to process speech: ${error.message}`);
    }
  }
);

// API Endpoint: Get cocktail recommendation from speech
exports.getCocktailFromSpeech = functions.https.onCall(
  async (data, context) => {
    const { speechText, conversationHistory } = data;

    if (!speechText || typeof speechText !== 'string') {
      throw new HttpsError('invalid-argument', 'Speech text is required and must be a string');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError('internal', 'Gemini API key is not configured');
    }

    try {
      // Build conversation context
      let conversationContext = '';
      if (conversationHistory && Array.isArray(conversationHistory)) {
        conversationContext = conversationHistory
          .slice(-3) // Keep last 3 exchanges for context
          .map(item => `User: ${item.user}\nBartender: ${item.bartender}`)
          .join('\n\n');
      }

      const prompt = `You are a knowledgeable and creative cocktail bartender at "Tips & Thirst" bar. 
You have access to a wide variety of cocktail recipes and can create new ones based on customer preferences.

${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}

Customer says: "${speechText}"

Please respond as a friendly bartender would. If they want a cocktail recommendation, suggest 1-2 specific cocktails with:
- Cocktail name
- Brief description
- Key ingredients
- Simple preparation instructions

Keep your response conversational and engaging, like you're chatting with a customer at the bar. If they ask about something else, respond helpfully but try to steer the conversation toward cocktails when appropriate.

Response format: Keep it natural, like spoken conversation.`;

      const response = await callGeminiAPI(prompt);

      return {
        response: response,
        cocktailRecommendation: null, // We'll parse this from the response if needed
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error in getCocktailFromSpeech:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', `Failed to get cocktail recommendation: ${error.message}`);
    }
  }
);

// Helper function to extract cocktail info from conversational response
function extractCocktailFromResponse(response) {
  try {
    // Look for cocktail name (often in quotes or as first sentence)
    const nameMatch = response.match(/(?:try|make|recommend|suggest)(?:ing)?\s+(?:a\s+)?["']?([^"'.!?\n]+)["']?[.!]?/i);
    const cocktailName = nameMatch ? nameMatch[1].trim() : 'Recommended Cocktail';

    // Extract ingredients section
    const ingredientsMatch = response.match(/ingredients?:?\s*([\s\S]*?)(?=instructions?|directions?|method|steps|\n\n|$)/i);
    let ingredients = [];
    if (ingredientsMatch) {
      ingredients = ingredientsMatch[1]
        .split(/\n|,|\d+\./)
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0 && !ing.match(/^(instructions?|directions?|method|steps)/i))
        .slice(0, 8); // Limit to reasonable number
    }

    // Extract instructions
    const instructionsMatch = response.match(/(?:instructions?|directions?|method|steps):?\s*([\s\S]*?)(?:\n\n|$)/i);
    let instructions = '';
    if (instructionsMatch) {
      instructions = instructionsMatch[1].trim();
    }

    if (ingredients.length > 0 || instructions) {
      return {
        name: cocktailName,
        ingredients: ingredients,
        instructions: instructions,
        description: response.split('.')[0] + '.' // First sentence as description
      };
    }

    return null;
  } catch (error) {
    console.error('Error extracting cocktail from response:', error);
    return null;
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
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Generative Language API Key not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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