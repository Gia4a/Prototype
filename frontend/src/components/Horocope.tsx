import { useState } from 'react';

// Astrology signs with their symbols
const ASTROLOGY_SIGNS = [
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

// Organize signs into 3 rows of 4
const SIGN_ROWS = [
  ASTROLOGY_SIGNS.slice(0, 4),   // Aries, Taurus, Gemini, Cancer
  ASTROLOGY_SIGNS.slice(4, 8),   // Leo, Virgo, Libra, Scorpio
  ASTROLOGY_SIGNS.slice(8, 12)   // Sagittarius, Capricorn, Aquarius, Pisces
];

const DailyHoroscope = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedSign, setSelectedSign] = useState(null);

  const handleSignSelect = (sign: { name: string; symbol: string; displayName: string }) => {
    setSelectedSign(sign);
    // Here you would integrate with your recipe system
    console.log(`Selected sign: ${sign.name}`);
    // You can call your getCurrentRecipe(sign.name) here
    setIsPopupOpen(false);
  };

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="relative">
      {/* Daily Horoscope Button */}
      <button
        onClick={openPopup}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg"
      >
        Daily Horoscope
      </button>

      {/* Popup Overlay */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-xl p-8 relative shadow-2xl"
            style={{ 
              width: '80vw', 
              height: '70vh',
              maxWidth: '800px',
              maxHeight: '600px'
            }}
          >
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              Select Your Zodiac Sign
            </h2>

            {/* Signs Grid - 3 rows x 4 columns */}
            <div className="h-full flex flex-col justify-center">
              <div className="space-y-8">
                {SIGN_ROWS.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-evenly">
                    {row.map((sign) => (
                      <div
                        key={sign.name}
                        className="flex flex-col items-center"
                      >
                        {/* Circular Button with Symbol */}
                        <button
                          onClick={() => handleSignSelect(sign)}
                          className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          {sign.symbol}
                        </button>
                        
                        {/* Sign Name */}
                        <span className="mt-2 text-sm font-medium text-gray-700 text-center">
                          {sign.displayName}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Sign Display (optional) */}
            {selectedSign && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-600">
                Last selected: {selectedSign.displayName}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyHoroscope;