import React from 'react';

interface HoroscopeData {
  sign: string;
  cocktailName: string;
  moonPhase: string;
  ruler: string;
  element: string;
  ingredients: string[];
  instructions: string;
  theme: string;
  insight: string;
}

interface CompactHoroscopeCardProps {
  data: HoroscopeData;
}

const CompactHoroscopeCard: React.FC<CompactHoroscopeCardProps> = ({ data }) => {
  // Provide default data if none is passed
  const defaultData: HoroscopeData = {
    sign: "Gemini",
    cocktailName: "Gemini's Vodka Soda",
    moonPhase: "waning crescent",
    ruler: "Mercury",
    element: "Air",
    ingredients: ["2oz Vodka", "Soda Water", "Lime Wedge"],
    instructions: "Add vodka to glass with ice, top with soda water, squeeze lime wedge",
    theme: "Quiet reflection with mercury influence",
    insight: "Waning Crescent energy invites introspection, time to refine and release with mindful mixology."
  };

  const horoscopeData = data || defaultData;

  return (
    <div className="w-full h-full bg-gray-900 text-white flex items-center justify-center p-2">
      <div className="w-[95%] max-w-md bg-gray-800 rounded-lg border border-blue-400 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 text-center">
          <h2 className="text-lg font-bold">{horoscopeData.sign} Cosmic Cocktail</h2>
          <div className="flex justify-center items-center gap-2 mt-1 text-sm">
            <span>🌙 {horoscopeData.moonPhase}</span>
            <span>•</span>
            <span>🪐 {horoscopeData.ruler}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Drink Title */}
          <div className="text-center">
            <h3 className="text-yellow-400 font-semibold text-base">✨ {horoscopeData.cocktailName}</h3>
          </div>

          {/* 4-Line Idiom Style Description */}
          <div className="text-center text-sm leading-relaxed bg-gray-700 rounded p-2">
            <p className="italic text-blue-200">
              {horoscopeData.insight}
              <br />
              <span className="text-purple-300 text-xs mt-1 block">
                {horoscopeData.theme}
              </span>
            </p>
          </div>

          {/* Ingredients & Instructions Row */}
          <div className="grid grid-cols-4 gap-2 text-sm">
            {/* Ingredients Column (1 width) */}
            <div className="col-span-1">
              <h4 className="font-semibold text-green-400 mb-1">🍹 Mix:</h4>
              <ul className="text-xs space-y-0.5">
                {horoscopeData.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-gray-300">• {ingredient}</li>
                ))}
              </ul>
            </div>

            {/* Instructions Column (3 width) */}
            <div className="col-span-3">
              <h4 className="font-semibold text-orange-400 mb-1">⚡ Method:</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                {horoscopeData.instructions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactHoroscopeCard;