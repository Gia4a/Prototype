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

const HoroscopeGrid = ({ onSignSelect }: { onSignSelect: (sign: { name: string; symbol: string; displayName: string }) => void }) => {
  return (
    <div 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '15px', 
        width: '100%', /* Ensure full width */
        maxWidth: '600px', /* Limit maximum width */
        margin: '0 auto', /* Center horizontally */
      }}
    >
      {ASTROLOGY_SIGNS.map((sign) => (
        <div
          key={sign.name}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* Circular Button with Symbol */}
          <button
            onClick={() => onSignSelect(sign)}
            style={{
              width: '80px', // Doubled size
              height: '80px', // Doubled size
              background: 'transparent', // Removed background
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '47px', // Adjusted font size for larger icons
              fontWeight: 'bold',
              boxShadow: 'none', // Removed shadow
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {sign.symbol}
          </button>
          
          {/* Sign Name */}
          <span style={{ marginTop: '8px', fontSize: '16px', fontWeight: '500', color: 'white' }}>
            {sign.displayName}
          </span>
        </div>
      ))}
    </div>
  );
};

export default HoroscopeGrid;