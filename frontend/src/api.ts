// api.ts - Shared API functions using local data and Gemini AI
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAIWQtqpRd02wXOG9a6rsVW0B1PxHWkl2M');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Speech-based cocktail recommendation using client-side Gemini AI
export async function getCocktailFromSpeech(speechText: string, conversationHistory?: Array<{user: string, bartender: string}>) {
    try {
        // Build conversation context
        let conversationContext = '';
        if (conversationHistory && conversationHistory.length > 0) {
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

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return {
            response: text,
            cocktailRecommendation: null, // We'll parse this from the response if needed
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw new Error('Failed to get cocktail recommendation');
    }
}

// Local fallback data for horoscope recipes (will use Firestore when billing is enabled)
const localHoroscopeData = [
    {
        sign: 'aries',
        element: 'fire',
        planetary_ruler: 'mars',
        recipe: {
            name: 'Fiery Aries Punch',
            base_spirit: 'bourbon',
            mixer: 'cranberry juice',
            mixer2: 'ginger beer',
            liqueur: 'cinnamon schnapps',
            citrus: 'lime',
            sweetener: 'honey',
            seasoning: 'cayenne pepper',
            instructions: [
                'Muddle lime and honey in shaker',
                'Add bourbon, cranberry juice, and cinnamon schnapps',
                'Shake with ice and strain into glass',
                'Top with ginger beer and cayenne rim'
            ],
            theme: 'Bold and fiery like Aries energy'
        },
        planetary_influence: {
            spirit_style: 'Bold and warming spirits',
            color_theme: 'Red and orange hues',
            energy_level: 'High energy, stimulating'
        },
        astrological_note: 'Mars-ruled Aries needs bold, warming cocktails that match their fiery nature'
    },
    {
        sign: 'taurus',
        element: 'earth',
        planetary_ruler: 'venus',
        recipe: {
            name: 'Velvet Taurus Elixir',
            base_spirit: 'gin',
            mixer: 'cream',
            mixer2: 'vanilla syrup',
            liqueur: 'chocolate liqueur',
            citrus: 'none',
            sweetener: 'brown sugar',
            cream: 'heavy cream',
            seasoning: 'cinnamon',
            instructions: [
                'Shake gin, cream, vanilla syrup, and chocolate liqueur with ice',
                'Strain into chilled glass',
                'Garnish with cinnamon dust',
                'Sip slowly to appreciate the luxurious texture'
            ],
            theme: 'Rich and sensual like Taurus appreciation for luxury'
        },
        planetary_influence: {
            spirit_style: 'Smooth, creamy liqueurs',
            color_theme: 'Deep browns and creams',
            energy_level: 'Calm and grounding'
        },
        astrological_note: 'Venus-ruled Taurus enjoys luxurious, sensory-rich cocktails'
    },
    {
        sign: 'gemini',
        element: 'air',
        planetary_ruler: 'mercury',
        recipe: {
            name: 'Mercury Messenger',
            base_spirit: 'vodka',
            mixer: 'lemonade',
            mixer2: 'club soda',
            liqueur: 'elderflower liqueur',
            citrus: 'lemon',
            sweetener: 'simple syrup',
            seasoning: 'mint',
            instructions: [
                'Muddle mint and lemon in shaker',
                'Add vodka, elderflower liqueur, and simple syrup',
                'Shake with ice and strain into glass',
                'Top with club soda and lemonade',
                'Garnish with mint sprig'
            ],
            theme: 'Light and refreshing like Gemini\'s quick wit'
        },
        planetary_influence: {
            spirit_style: 'Clear, versatile spirits',
            color_theme: 'Yellow and silver',
            energy_level: 'Light and refreshing'
        },
        astrological_note: 'Mercury-ruled Gemini prefers versatile, conversation-sparking cocktails'
    },
    {
        sign: 'cancer',
        element: 'water',
        planetary_ruler: 'moon',
        recipe: {
            name: 'Lunar Comfort',
            base_spirit: 'rum',
            mixer: 'coconut milk',
            mixer2: 'pineapple juice',
            liqueur: 'creme de coconut',
            citrus: 'lime',
            sweetener: 'brown sugar',
            cream: 'coconut cream',
            seasoning: 'nutmeg',
            instructions: [
                'Shake rum, coconut milk, pineapple juice, and creme de coconut with ice',
                'Strain into glass with ice',
                'Garnish with nutmeg and lime wheel',
                'Sip slowly for comfort and nostalgia'
            ],
            theme: 'Nurturing and comforting like Cancer\'s caring nature'
        },
        planetary_influence: {
            spirit_style: 'Creamy, comforting spirits',
            color_theme: 'White and silver',
            energy_level: 'Soothing and emotional'
        },
        astrological_note: 'Moon-ruled Cancer finds comfort in creamy, nurturing cocktails'
    },
    {
        sign: 'leo',
        element: 'fire',
        planetary_ruler: 'sun',
        recipe: {
            name: 'Solar Flare',
            base_spirit: 'tequila',
            mixer: 'orange juice',
            mixer2: 'grenadine',
            liqueur: 'triple sec',
            citrus: 'orange',
            sweetener: 'agave syrup',
            seasoning: 'cinnamon',
            instructions: [
                'Shake tequila, orange juice, triple sec, and agave with ice',
                'Strain into salt-rimmed glass',
                'Add grenadine for sunrise effect',
                'Garnish with orange twist'
            ],
            theme: 'Bright and dramatic like Leo\'s personality'
        },
        planetary_influence: {
            spirit_style: 'Bold, warming spirits',
            color_theme: 'Gold and orange',
            energy_level: 'Warm and celebratory'
        },
        astrological_note: 'Sun-ruled Leo commands attention with bright, celebratory cocktails'
    },
    {
        sign: 'virgo',
        element: 'earth',
        planetary_ruler: 'mercury',
        recipe: {
            name: 'Virgo\'s Herbal Remedy',
            base_spirit: 'gin',
            mixer: 'tonic water',
            mixer2: 'cucumber water',
            liqueur: 'elderflower liqueur',
            citrus: 'lemon',
            sweetener: 'honey',
            seasoning: 'fresh herbs',
            instructions: [
                'Muddle cucumber, lemon, and herbs in shaker',
                'Add gin and elderflower liqueur',
                'Shake with ice and strain into glass',
                'Top with tonic water',
                'Garnish with cucumber ribbon'
            ],
            theme: 'Clean and precise like Virgo\'s analytical nature'
        },
        planetary_influence: {
            spirit_style: 'Clean, herbal spirits',
            color_theme: 'Green and white',
            energy_level: 'Calm and focused'
        },
        astrological_note: 'Mercury-ruled Virgo appreciates clean, well-balanced herbal cocktails'
    },
    {
        sign: 'libra',
        element: 'air',
        planetary_ruler: 'venus',
        recipe: {
            name: 'Balance & Harmony',
            base_spirit: 'vodka',
            mixer: 'cranberry juice',
            mixer2: 'club soda',
            liqueur: 'peach schnapps',
            citrus: 'lime',
            sweetener: 'simple syrup',
            seasoning: 'mint',
            instructions: [
                'Shake vodka, cranberry juice, peach schnapps, and lime with ice',
                'Strain into glass with ice',
                'Top with club soda',
                'Garnish with mint and lime wheel'
            ],
            theme: 'Balanced and beautiful like Libra\'s sense of harmony'
        },
        planetary_influence: {
            spirit_style: 'Balanced, fruity spirits',
            color_theme: 'Pink and light blue',
            energy_level: 'Harmonious and social'
        },
        astrological_note: 'Venus-ruled Libra seeks balance and beauty in cocktail aesthetics'
    },
    {
        sign: 'scorpio',
        element: 'water',
        planetary_ruler: 'pluto',
        recipe: {
            name: 'Mystic Scorpio',
            base_spirit: 'whiskey',
            mixer: 'blackberry puree',
            mixer2: 'ginger syrup',
            liqueur: 'black raspberry liqueur',
            citrus: 'lemon',
            sweetener: 'demerara sugar',
            seasoning: 'black pepper',
            instructions: [
                'Muddle blackberries and lemon in shaker',
                'Add whiskey, raspberry liqueur, and ginger syrup',
                'Shake with ice and double strain',
                'Serve in rocks glass with black pepper garnish'
            ],
            theme: 'Deep and mysterious like Scorpio\'s intense nature'
        },
        planetary_influence: {
            spirit_style: 'Dark, intense spirits',
            color_theme: 'Deep purple and black',
            energy_level: 'Intense and transformative'
        },
        astrological_note: 'Pluto-ruled Scorpio is drawn to deep, transformative cocktail experiences'
    },
    {
        sign: 'sagittarius',
        element: 'fire',
        planetary_ruler: 'jupiter',
        recipe: {
            name: 'Jupiter\'s Journey',
            base_spirit: 'rum',
            mixer: 'pineapple juice',
            mixer2: 'coconut water',
            liqueur: 'passion fruit liqueur',
            citrus: 'lime',
            sweetener: 'brown sugar',
            seasoning: 'allspice',
            instructions: [
                'Shake rum, pineapple juice, passion fruit liqueur, and lime with ice',
                'Strain into tiki glass with ice',
                'Top with coconut water',
                'Garnish with pineapple and allspice'
            ],
            theme: 'Adventurous and exotic like Sagittarius\' wanderlust'
        },
        planetary_influence: {
            spirit_style: 'Exotic, tropical spirits',
            color_theme: 'Bright colors and patterns',
            energy_level: 'Adventurous and expansive'
        },
        astrological_note: 'Jupiter-ruled Sagittarius loves exotic, worldly cocktail adventures'
    },
    {
        sign: 'capricorn',
        element: 'earth',
        planetary_ruler: 'saturn',
        recipe: {
            name: 'Capricorn Reserve',
            base_spirit: 'scotch',
            mixer: 'coffee liqueur',
            mixer2: 'cream',
            liqueur: 'chocolate liqueur',
            citrus: 'none',
            sweetener: 'brown sugar',
            cream: 'heavy cream',
            seasoning: 'espresso powder',
            instructions: [
                'Shake scotch, coffee liqueur, chocolate liqueur, and cream with ice',
                'Strain into glass',
                'Dust with espresso powder',
                'Sip mindfully like a refined ritual'
            ],
            theme: 'Refined and structured like Capricorn\'s disciplined nature'
        },
        planetary_influence: {
            spirit_style: 'Aged, refined spirits',
            color_theme: 'Black, brown, and gold',
            energy_level: 'Grounded and focused'
        },
        astrological_note: 'Saturn-ruled Capricorn appreciates aged, sophisticated cocktails'
    },
    {
        sign: 'aquarius',
        element: 'air',
        planetary_ruler: 'uranus',
        recipe: {
            name: 'Electric Aquarius',
            base_spirit: 'gin',
            mixer: 'blue curacao',
            mixer2: 'club soda',
            liqueur: 'violet liqueur',
            citrus: 'lemon',
            sweetener: 'simple syrup',
            seasoning: 'edible glitter',
            instructions: [
                'Shake gin, blue curacao, violet liqueur, and lemon with ice',
                'Strain into glass',
                'Top with club soda',
                'Add edible glitter for electric effect'
            ],
            theme: 'Innovative and unconventional like Aquarius\' forward-thinking nature'
        },
        planetary_influence: {
            spirit_style: 'Unique, experimental spirits',
            color_theme: 'Electric blue and silver',
            energy_level: 'Innovative and unconventional'
        },
        astrological_note: 'Uranus-ruled Aquarius embraces experimental, futuristic cocktails'
    },
    {
        sign: 'pisces',
        element: 'water',
        planetary_ruler: 'neptune',
        recipe: {
            name: 'Neptune\'s Dream',
            base_spirit: 'vodka',
            mixer: 'blueberry puree',
            mixer2: 'lemonade',
            liqueur: 'lavender liqueur',
            citrus: 'lemon',
            sweetener: 'honey',
            seasoning: 'dried lavender',
            instructions: [
                'Shake vodka, blueberry puree, lavender liqueur, and lemon with ice',
                'Strain into glass',
                'Top with lemonade',
                'Garnish with lavender sprig'
            ],
            theme: 'Dreamy and ethereal like Pisces\' imaginative nature'
        },
        planetary_influence: {
            spirit_style: 'Floral, dreamy spirits',
            color_theme: 'Soft blues and purples',
            energy_level: 'Dreamy and intuitive'
        },
        astrological_note: 'Neptune-ruled Pisces is drawn to dreamy, otherworldly cocktail experiences'
    }
];

// Fetch horoscope data (using local data for now, will switch to Firestore when billing is enabled)
export async function fetchHoroscope(sign: string) {
    try {
        // For now, use local data. Later this will query Firestore:
        // const horoscopeRef = collection(db, 'horoscopeRecipes');
        // const q = query(horoscopeRef, where('sign', '==', sign.toLowerCase()));
        // const querySnapshot = await getDocs(q);

        const recipe = localHoroscopeData.find(r => r.sign === sign.toLowerCase());

        if (recipe) {
            // Calculate current moon phase
            const moonPhase = getCurrentMoonPhase();

            return {
                ...recipe,
                moonPhase,
                timestamp: new Date().toISOString()
            };
        } else {
            throw new Error(`No horoscope recipe found for sign: ${sign}`);
        }
    } catch (error) {
        console.error('Error fetching horoscope:', error);
        throw new Error('Failed to fetch horoscope data');
    }
}

// Helper function to calculate moon phase
function getCurrentMoonPhase(): string {
    const phases = [
        'new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
        'full_moon', 'waning_gibbous', 'third_quarter', 'waning_crescent'
    ];
    const now = new Date();
    const dayOfMonth = now.getDate();
    const phaseIndex = Math.floor((dayOfMonth / 30) * 8) % 8;
    return phases[phaseIndex];
}
