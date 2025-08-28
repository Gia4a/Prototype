import { useState } from 'react';
import axios from 'axios';

interface AstrologySign {
  name: string;
  symbol: string;
  displayName: string;
}

interface RecipeData {
  sign: string;
  element: string;
  moon_phase: string;
  planetary_ruler: string;
  recipe: {
    name: string;
    base_spirit?: string;
    mixer?: string;
    mixer2?: string;
    liqueur?: string;
    citrus?: string;
    sweetener?: string;
    cream?: string;
    seasoning?: string;
    instructions: string[];
    theme: string;
  };
  planetary_influence: {
    spirit_style: string;
    color_theme: string;
    energy_level: string;
  };
  astrological_note: string;
}

const ASTROLOGY_SIGNS: AstrologySign[] = [
  { name: 'aries', symbol: '♈', displayName: 'Aries' },
  { name: 'taurus', symbol: '♉', displayName: 'Taurus' },
  { name: 'gemini', symbol: '♊', displayName: 'Gemini' },
  { name: 'cancer', symbol: '♋', displayName: 'Cancer' },
  { name: 'leo', symbol: '♌', displayName: 'Leo' },
  { name: 'virgo', symbol: '♍', displayName: 'Virgo' },
  { name: 'libra', symbol: '♎', displayName: 'Libra' },
  { name: 'scorpio', symbol: '♏', displayName: 'Scorpio' },
  { name: 'sagittarius', symbol: '♐', displayName: 'Sagittarius' },
  { name: 'capricorn', symbol: '♑', displayName: 'Capricorn' },
  { name: 'aquarius', symbol: '♒', displayName: 'Aquarius' },
  { name: 'pisces', symbol: '♓', displayName: 'Pisces' }
];

// HoroscopeRecipes class integrated from your horoscopeRecipe.js
class HoroscopeRecipes {
  baseRecipes: { [key: string]: any };
  signs: { [key: string]: { element: string; modality: string; ruler: string } };
  planetaryModifiers: { [key: string]: { spirit_modifier: string; color: string; intensity: string } };
  moonPhases: string[];

  constructor() {
    this.baseRecipes = {
      // FIRE ELEMENT RECIPES
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
      fire_first_quarter: {
        name: "Margarita",
        base_spirit: "tequila",
        liqueur: "triple_sec",
        citrus: "lime_juice",
        instructions: ["Add 2oz tequila, 1oz triple sec, 1oz lime juice to shaker with ice", "Shake well", "Strain over ice"],
        theme: "Taking decisive action"
      },
      fire_waxing_gibbous: {
        name: "Old Fashioned",
        base_spirit: "bourbon",
        sweetener: "simple_syrup",
        citrus: "orange_peel",
        instructions: ["Add 2oz bourbon and 0.5oz simple syrup to glass", "Add ice and stir", "Express orange peel oils over drink"],
        theme: "Intensifying passion"
      },
      fire_full_moon: {
        name: "Dark & Stormy",
        base_spirit: "dark_rum",
        mixer: "ginger_beer",
        citrus: "lime_wedge",
        instructions: ["Add 2oz dark rum to glass with ice", "Top with ginger beer", "Squeeze lime wedge"],
        theme: "Maximum fire energy"
      },
      fire_waning_gibbous: {
        name: "Hot Toddy",
        base_spirit: "whiskey",
        mixer: "hot_water",
        sweetener: "honey",
        instructions: ["Add 2oz whiskey and 1 tbsp honey to mug", "Top with hot water", "Stir until honey dissolves"],
        theme: "Releasing intensity"
      },
      fire_third_quarter: {
        name: "Whiskey Sour",
        base_spirit: "bourbon",
        citrus: "lemon_juice",
        sweetener: "simple_syrup",
        instructions: ["Add 2oz bourbon, 1oz lemon juice, 0.75oz simple syrup to shaker with ice", "Shake well", "Strain over ice"],
        theme: "Gentle release"
      },
      fire_waning_crescent: {
        name: "Hot Buttered Rum",
        base_spirit: "dark_rum",
        mixer: "hot_water",
        sweetener: "butter_and_brown_sugar",
        instructions: ["Add 2oz dark rum, 1 tsp butter, 1 tsp brown sugar to mug", "Top with hot water", "Stir well"],
        theme: "Peaceful conclusion"
      },

      // EARTH ELEMENT RECIPES  
      earth_new_moon: {
        name: "Black Russian",
        base_spirit: "vodka",
        liqueur: "coffee_liqueur",
        instructions: ["Add 2oz vodka and 1oz coffee liqueur to glass with ice", "Stir gently"],
        theme: "Grounding new intentions"
      },
      earth_waxing_crescent: {
        name: "Bloody Mary",
        base_spirit: "vodka",
        mixer: "tomato_juice",
        seasoning: "salt_pepper",
        instructions: ["Add 2oz vodka to glass with ice", "Top with tomato juice", "Add pinch of salt and pepper", "Stir"],
        theme: "Steady growth"
      },
      earth_first_quarter: {
        name: "Gin & Tonic",
        base_spirit: "gin",
        mixer: "tonic_water",
        citrus: "lime_wedge",
        instructions: ["Add 2oz gin to glass with ice", "Top with tonic water", "Squeeze lime wedge"],
        theme: "Practical action"
      },
      earth_waxing_gibbous: {
        name: "White Russian",
        base_spirit: "vodka",
        liqueur: "coffee_liqueur",
        cream: "heavy_cream",
        instructions: ["Add 2oz vodka and 1oz coffee liqueur to glass with ice", "Float 0.5oz cream on top"],
        theme: "Abundant preparation"
      },
      earth_full_moon: {
        name: "Mudslide",
        base_spirit: "vodka",
        liqueur: "coffee_liqueur",
        cream: "heavy_cream",
        instructions: ["Add 1.5oz vodka, 1.5oz coffee liqueur, 1oz cream to shaker with ice", "Shake well", "Strain over ice"],
        theme: "Peak abundance"
      },
      earth_waning_gibbous: {
        name: "Godfather",
        base_spirit: "whiskey",
        liqueur: "amaretto",
        instructions: ["Add 2oz whiskey and 0.75oz amaretto to glass with ice", "Stir gently"],
        theme: "Grateful release"
      },
      earth_third_quarter: {
        name: "Moscow Mule",
        base_spirit: "vodka",
        mixer: "ginger_beer",
        citrus: "lime_wedge",
        instructions: ["Add 2oz vodka to glass with ice", "Top with ginger beer", "Squeeze lime wedge"],
        theme: "Transformation"
      },
      earth_waning_crescent: {
        name: "Irish Coffee",
        base_spirit: "irish_whiskey",
        mixer: "hot_coffee",
        sweetener: "brown_sugar",
        cream: "whipped_cream",
        instructions: ["Add 2oz Irish whiskey and 1 tsp brown sugar to mug", "Top with hot coffee", "Float whipped cream"],
        theme: "Peaceful rest"
      },

      // AIR ELEMENT RECIPES
      air_new_moon: {
        name: "Gin Fizz",
        base_spirit: "gin",
        citrus: "lemon_juice",
        sweetener: "simple_syrup",
        mixer: "soda_water",
        instructions: ["Add 2oz gin, 1oz lemon juice, 0.5oz simple syrup to shaker with ice", "Shake well", "Strain into glass", "Top with soda water"],
        theme: "Clear mental space"
      },
      air_waxing_crescent: {
        name: "Tom Collins",
        base_spirit: "gin",
        citrus: "lemon_juice",
        sweetener: "simple_syrup",
        mixer: "soda_water",
        instructions: ["Add 2oz gin, 1oz lemon juice, 0.5oz simple syrup to glass with ice", "Top with soda water", "Stir"],
        theme: "Mental expansion"
      },
      air_first_quarter: {
        name: "Gimlet",
        base_spirit: "gin",
        citrus: "lime_juice",
        sweetener: "simple_syrup",
        instructions: ["Add 2oz gin, 0.75oz lime juice, 0.75oz simple syrup to shaker with ice", "Shake well", "Strain into glass"],
        theme: "Focused thought"
      },
      air_waxing_gibbous: {
        name: "French 75",
        base_spirit: "gin",
        citrus: "lemon_juice",
        sweetener: "simple_syrup",
        mixer: "champagne",
        instructions: ["Add 1oz gin, 0.5oz lemon juice, 0.25oz simple syrup to shaker with ice", "Shake well", "Strain into glass", "Top with champagne"],
        theme: "Social connection"
      },
      air_full_moon: {
        name: "Martini",
        base_spirit: "gin",
        liqueur: "dry_vermouth",
        instructions: ["Add 2.5oz gin and 0.5oz dry vermouth to mixing glass with ice", "Stir well", "Strain into chilled glass"],
        theme: "Mental clarity"
      },
      air_waning_gibbous: {
        name: "Vodka Tonic",
        base_spirit: "vodka",
        mixer: "tonic_water",
        citrus: "lime_wedge",
        instructions: ["Add 2oz vodka to glass with ice", "Top with tonic water", "Squeeze lime wedge"],
        theme: "Releasing thoughts"
      },
      air_third_quarter: {
        name: "Screwdriver",
        base_spirit: "vodka",
        mixer: "orange_juice",
        instructions: ["Add 2oz vodka to glass with ice", "Top with orange juice", "Stir once"],
        theme: "Mental cleansing"
      },
      air_waning_crescent: {
        name: "Vodka Soda",
        base_spirit: "vodka",
        mixer: "soda_water",
        citrus: "lime_wedge",
        instructions: ["Add 2oz vodka to glass with ice", "Top with soda water", "Squeeze lime wedge"],
        theme: "Quiet reflection"
      },

      // WATER ELEMENT RECIPES
      water_new_moon: {
        name: "Cape Codder",
        base_spirit: "vodka",
        mixer: "cranberry_juice",
        citrus: "lime_wedge",
        instructions: ["Add 2oz vodka to glass with ice", "Top with cranberry juice", "Squeeze lime wedge"],
        theme: "Emotional depths"
      },
      water_waxing_crescent: {
        name: "Bay Breeze",
        base_spirit: "vodka",
        mixer: "cranberry_juice",
        mixer2: "pineapple_juice",
        instructions: ["Add 2oz vodka to glass with ice", "Add equal parts cranberry and pineapple juice", "Stir"],
        theme: "Emotional growth"
      },
      water_first_quarter: {
        name: "Greyhound",
        base_spirit: "vodka",
        mixer: "grapefruit_juice",
        instructions: ["Add 2oz vodka to glass with ice", "Top with grapefruit juice", "Stir once"],
        theme: "Emotional clarity"
      },
      water_waxing_gibbous: {
        name: "Sea Breeze",
        base_spirit: "vodka",
        mixer: "cranberry_juice",
        mixer2: "grapefruit_juice",
        instructions: ["Add 2oz vodka to glass with ice", "Add equal parts cranberry and grapefruit juice", "Stir"],
        theme: "Emotional intensity"
      },
      water_full_moon: {
        name: "Cosmopolitan",
        base_spirit: "vodka",
        liqueur: "triple_sec",
        mixer: "cranberry_juice",
        citrus: "lime_juice",
        instructions: ["Add 2oz vodka, 1oz triple sec, 0.5oz cranberry juice, 0.5oz lime juice to shaker with ice", "Shake well", "Strain into glass"],
        theme: "Peak intuition"
      },
      water_waning_gibbous: {
        name: "Madras",
        base_spirit: "vodka",
        mixer: "cranberry_juice",
        mixer2: "orange_juice",
        instructions: ["Add 2oz vodka to glass with ice", "Add equal parts cranberry and orange juice", "Stir"],
        theme: "Emotional release"
      },
      water_third_quarter: {
        name: "Vodka Cranberry",
        base_spirit: "vodka",
        mixer: "cranberry_juice",
        instructions: ["Add 2oz vodka to glass with ice", "Top with cranberry juice", "Stir once"],
        theme: "Emotional calm"
      },
      water_waning_crescent: {
        name: "Lemon Drop",
        base_spirit: "lemon_vodka",
        sweetener: "simple_syrup",
        citrus: "lemon_juice",
        instructions: ["Add 2oz lemon vodka and 0.5oz simple syrup to shaker with ice", "Shake well", "Strain into glass"],
        theme: "Emotional renewal"
      }
    };

    this.signs = {
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

    this.planetaryModifiers = {
      mars: { spirit_modifier: 'spiced', color: 'red', intensity: 'bold' },
      venus: { spirit_modifier: 'vanilla', color: 'pink', intensity: 'smooth' },
      mercury: { spirit_modifier: 'citrus', color: 'yellow', intensity: 'bright' },
      moon: { spirit_modifier: 'coconut', color: 'silver', intensity: 'gentle' },
      sun: { spirit_modifier: 'gold', color: 'gold', intensity: 'radiant' },
      jupiter: { spirit_modifier: 'honey', color: 'amber', intensity: 'expansive' },
      saturn: { spirit_modifier: 'aged', color: 'brown', intensity: 'structured' },
      uranus: { spirit_modifier: 'electric', color: 'blue', intensity: 'innovative' },
      neptune: { spirit_modifier: 'berry', color: 'ocean_blue', intensity: 'dreamy' },
      pluto: { spirit_modifier: 'dark', color: 'black', intensity: 'transformative' }
    };

    this.moonPhases = [
      'new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
      'full_moon', 'waning_gibbous', 'third_quarter', 'waning_crescent'
    ];
  }

  getRecipe(sign: string, moonPhase: string): RecipeData {
    if (!this.signs[sign]) {
      throw new Error(`Invalid sign: ${sign}`);
    }

    const signData = this.signs[sign];
    const baseRecipeKey = `${signData.element}_${moonPhase}`;
    const baseRecipe = this.baseRecipes[baseRecipeKey];

    if (!baseRecipe) {
      throw new Error(`No recipe found for ${signData.element} ${moonPhase}`);
    }

    const planetaryModifier = this.planetaryModifiers[signData.ruler];

    return {
      sign: sign.charAt(0).toUpperCase() + sign.slice(1),
      element: signData.element,
      moon_phase: moonPhase.replace('_', ' '),
      planetary_ruler: signData.ruler,
      recipe: {
        name: `${sign.charAt(0).toUpperCase() + sign.slice(1)}'s ${baseRecipe.name}`,
        base_spirit: baseRecipe.base_spirit,
        mixer: baseRecipe.mixer,
        mixer2: baseRecipe.mixer2,
        liqueur: baseRecipe.liqueur,
        citrus: baseRecipe.citrus,
        sweetener: baseRecipe.sweetener,
        cream: baseRecipe.cream,
        seasoning: baseRecipe.seasoning,
        instructions: baseRecipe.instructions,
        theme: `${baseRecipe.theme} with ${signData.ruler} influence`
      },
      planetary_influence: {
        spirit_style: planetaryModifier.spirit_modifier,
        color_theme: planetaryModifier.color,
        energy_level: planetaryModifier.intensity
      },
      astrological_note: `Perfect for ${sign.charAt(0).toUpperCase() + sign.slice(1)} during ${moonPhase.replace('_', ' ')}`
    };
  }

  getCurrentMoonPhase(): string {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const phaseIndex = Math.floor((dayOfMonth / 30) * 8) % 8;
    return this.moonPhases[phaseIndex];
  }
}

const callGeminiAPI = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.candidates[0].content.parts[0].text || 'No insight available';
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return 'Error fetching data from Gemini API';
  }
};

const HoroscopeGrid = ({ onSignSelect }: { onSignSelect: (sign: AstrologySign) => void }) => {
  return (
    <div 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '15px', 
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      {ASTROLOGY_SIGNS.map((sign) => (
        <div
          key={sign.name}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <button
            onClick={() => onSignSelect(sign)}
            style={{
              width: '80px',
              height: '80px',
              background: 'transparent',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '47px',
              fontWeight: 'bold',
              boxShadow: 'none',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {sign.symbol}
          </button>
          
          <span style={{ marginTop: '8px', fontSize: '16px', fontWeight: '500', color: 'white' }}>
            {sign.displayName}
          </span>
        </div>
      ))}
    </div>
  );
};

// Fixed interface for Horoscope props
interface HoroscopeProps {
  onSignSelect: (sign: AstrologySign, result: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (error: string) => void;
}

const Horoscope: React.FC<HoroscopeProps> = ({ onSignSelect, onLoadingChange, onError }) => {
  const horoscopeRecipes = new HoroscopeRecipes();

  const handleSignSelect = async (sign: AstrologySign) => {
    console.log('=== HOROSCOPE SIGN SELECT ===');
    console.log('Selected sign:', sign);
    
    if (onLoadingChange) onLoadingChange(true);

    try {
      // Get moon phase from Gemini API
      const moonPhaseResponse = await callGeminiAPI(
        `What is today's moon phase? Please provide just the phase name: new moon, waxing crescent, first quarter, waxing gibbous, full moon, waning gibbous, third quarter, or waning crescent.`
      );

      const moonPhaseMatch = moonPhaseResponse.match(/(new_moon|waxing_crescent|first_quarter|waxing_gibbous|full_moon|waning_gibbous|third_quarter|waning_crescent)/i);
      const currentMoonPhase = moonPhaseMatch ? moonPhaseMatch[1].toLowerCase() : horoscopeRecipes.getCurrentMoonPhase();
      
      console.log('Current moon phase:', currentMoonPhase);

      // Get the recipe data
      const recipe = horoscopeRecipes.getRecipe(sign.name, currentMoonPhase);
      console.log('Recipe object:', recipe);

      // Get astrological insights from Gemini
      const insightResponse = await callGeminiAPI(
        `Provide astrological insights for ${sign.displayName} during ${currentMoonPhase.replace('_', ' ')} considering current planetary alignments. Keep it under 200 words and focus on how this cosmic energy enhances the cocktail experience.`
      );
      
      console.log('Insight response:', insightResponse);

      // Format the complete response for ResultsPopup
      const formattedResult = formatHoroscopeResult(recipe, insightResponse);
      
      console.log('About to call onSignSelect with:', { sign, formattedResult });
      
      // Pass the result back to parent
      onSignSelect(sign, formattedResult);

    } catch (error) {
      console.error('Error fetching astrological data:', error);
      
      if (onError) {
        onError('Unable to connect to cosmic servers. Using backup stellar data...');
      }

      // Provide fallback data
      const fallbackMoonPhase = horoscopeRecipes.getCurrentMoonPhase();
      const fallbackRecipe = horoscopeRecipes.getRecipe(sign.name, fallbackMoonPhase);
      const fallbackResult = formatHoroscopeResult(fallbackRecipe, "The cosmic energies are mysterious today, but your cocktail awaits!");
      
      console.log('Using fallback result:', fallbackResult);
      onSignSelect(sign, fallbackResult);
    }

    if (onLoadingChange) onLoadingChange(false);
  };

  const formatHoroscopeResult = (recipe: RecipeData, insight: string): string => {
    // Build ingredients list with better error handling
    const ingredients: string[] = [];
    
    const addIngredient = (ingredient: string | undefined, label?: string) => {
      if (ingredient) {
        const formatted = ingredient.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        ingredients.push(`• ${label ? label + ': ' : ''}${formatted}`);
      }
    };

    addIngredient(recipe.recipe.base_spirit, 'Base');
    addIngredient(recipe.recipe.mixer, 'Mixer');
    addIngredient(recipe.recipe.mixer2, 'Secondary Mixer');
    addIngredient(recipe.recipe.liqueur, 'Liqueur');
    addIngredient(recipe.recipe.citrus, 'Citrus');
    addIngredient(recipe.recipe.sweetener, 'Sweetener');
    addIngredient(recipe.recipe.cream, 'Cream');
    addIngredient(recipe.recipe.seasoning, 'Seasoning');

    const ingredientsSection = ingredients.length > 0 ? ingredients.join('\n') : '• Custom blend based on cosmic alignment';

    const result = `🌟 **${recipe.recipe.name}**

**🌙 Moon Phase:** ${recipe.moon_phase}
**🪐 Planetary Ruler:** ${recipe.planetary_ruler.charAt(0).toUpperCase() + recipe.planetary_ruler.slice(1)}
**🜁 Element:** ${recipe.element.charAt(0).toUpperCase() + recipe.element.slice(1)}

**🍹 Ingredients:**
${ingredientsSection}

**✨ Instructions:**
${recipe.recipe.instructions && recipe.recipe.instructions.length > 0 
  ? recipe.recipe.instructions.map((instruction, index) => `${index + 1}. ${instruction}`).join('\n')
  : 'Mix with intention and cosmic awareness'}

**🎨 Cosmic Influence:**
• Spirit Style: ${recipe.planetary_influence.spirit_style}
• Color Theme: ${recipe.planetary_influence.color_theme}
• Energy Level: ${recipe.planetary_influence.energy_level}

**🔮 Astrological Insight:**
${insight}

**💫 Theme:** ${recipe.recipe.theme}`;

    console.log('=== FORMATTED HOROSCOPE RESULT ===');
    console.log(result);
    console.log('=== END FORMATTED RESULT ===');
    
    return result;
  };

  return (
    <HoroscopeGrid onSignSelect={handleSignSelect} />
  );
};

export default Horoscope;
export { ASTROLOGY_SIGNS };