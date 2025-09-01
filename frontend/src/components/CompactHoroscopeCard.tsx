import React from 'react';

import STANDARD_STYLES from "./CardStyles";

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

// Enhanced CocktailData interface with upgrade functionality
interface CocktailData {
  cocktailName: string;
  ingredients: string[];
  instructions: string;
  comment: string | {
    poeticDescription?: string;
    personalComment?: string;
    upgradeComment?: string;
  };
  bartenderLine?: string;
  originalQuery?: string;
  onUpgrade?: (upgradeType: string) => void;
}

interface CompactCocktailCardProps {
  data: CocktailData;
}


const CompactHoroscopeCard: React.FC<CompactHoroscopeCardProps> = ({ data }) => {
  return (
    <>
      {/* Responsive style for container: 100vw on small screens */}
      <style>{`
        @media (max-width: 667px) {
          .responsive-container {
            width: 100vw !important;
            max-width: 100vw !important;
            min-width: 0 !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            border-radius: 0 0 16px 16px !important;
          }
        }
      `}</style>
      <div style={STANDARD_STYLES.containerStyle} className="responsive-container">
        <div style={STANDARD_STYLES.cardStyle}>
          {/* Header */}
          <div style={STANDARD_STYLES.headerStyle}>
            <h2 className="card-title">{data.cocktailName}</h2>
            {/* Only show moon/ruler for horoscope cards */}
            {data.moonPhase && data.ruler && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.8rem' }}>
                <span>🌙 {data.moonPhase}</span>
                <span>🪐 {data.ruler}</span>
              </div>
            )}
          </div>
          {/* Content */}
          <div style={STANDARD_STYLES.contentStyle}>
            {/* Description - using basic style for horoscope */}
            <div style={{
              ...STANDARD_STYLES.commentSectionStyle,
              border: 'none', // Remove cocktail-specific border
              boxShadow: 'none', // Remove cocktail-specific shadow
            }}>
              <div style={STANDARD_STYLES.poeticTextStyle}>
                {data.insight}
              </div>
            </div>
            {/* Ingredients & Instructions Row */}
            <div style={STANDARD_STYLES.detailsStyle} className="ingredients-section method-section">
              {/* Ingredients Column */}
              <div>
                <h4 style={STANDARD_STYLES.ingredientsTitleStyle}>🍹 Ingredients:</h4>
                <ul style={STANDARD_STYLES.ingredientsListStyle} className="ingredients-list">
                  {data.ingredients.map((ingredient, index) => (
                    <li key={index} style={STANDARD_STYLES.ingredientItemStyle}>• {ingredient}</li>
                  ))}
                </ul>
              </div>
              {/* Instructions Column */}
              <div>
                <h4 style={STANDARD_STYLES.instructionsTitleStyle}>⚡ Method:</h4>
                <div style={STANDARD_STYLES.instructionsTextStyle} className="method-content">
                  {data.instructions}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const CompactCocktailCard: React.FC<CompactCocktailCardProps> = ({ data }) => {
  // Handle upgrade button click
  const handleUpgrade = () => {
    if (data.onUpgrade) {
  const upgradeTypes = ['seasonal', 'spicy', 'elevate', 'festive'];
      const randomUpgrade = upgradeTypes[Math.floor(Math.random() * upgradeTypes.length)];
      data.onUpgrade(randomUpgrade);
    }
  };

  // Determine if upgrade functionality should be available
  const shouldShowUpgrade = data.onUpgrade && data.originalQuery;

  // Render comment content based on type - FIXED LAYOUT
  const renderComment = () => {
    if (typeof data.comment === 'string') {
      const lines = data.comment.split('\n');
      return (
        <div style={STANDARD_STYLES.commentSectionStyle}>
          <div style={STANDARD_STYLES.commentSectionButtonWrapper}>
            {/* Poetic lines at top - fully visible */}
            <div style={STANDARD_STYLES.poeticTextStyle}>
              {lines.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
            {/* Bartender message with spacing */}
            {data.bartenderLine && (
              <div style={{...STANDARD_STYLES.upgradeRowStyle, marginTop: '10px', marginBottom: '2px', color: '#fbbf24', fontStyle: 'italic', fontSize: '0.95em', textAlign: 'center'}}>
                {data.bartenderLine}
              </div>
            )}
            {/* Upgrade button absolutely positioned bottom right */}
            <button 
              style={STANDARD_STYLES.upgradeButtonStyle}
              onClick={handleUpgrade}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            >
              🔥 Upgrade
            </button>
          </div>
        </div>
      );
    }

    if (data.comment && typeof data.comment === 'object') {
      // Structured comment object
      return (
        <div style={STANDARD_STYLES.commentSectionStyle}>
          <div style={STANDARD_STYLES.commentSectionButtonWrapper}>
            {/* Poetic description at top */}
            {data.comment.poeticDescription && (
              <div style={STANDARD_STYLES.poeticTextStyle}>
                {data.comment.poeticDescription.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            )}
            {/* Bartender message */}
            {data.comment.upgradeComment && (
              <div style={STANDARD_STYLES.upgradeRowStyle}>
                <div>{data.comment.upgradeComment}</div>
              </div>
            )}
            {/* Upgrade button absolutely positioned bottom right */}
            {shouldShowUpgrade && (
              <button 
                style={STANDARD_STYLES.upgradeButtonStyle}
                onClick={handleUpgrade}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                🔥 Upgrade
              </button>
            )}
          </div>
        </div>
      );
    }

    // Fallback with upgrade button if available
    return (
      <div style={STANDARD_STYLES.commentSectionStyle}>
        <div style={STANDARD_STYLES.commentSectionButtonWrapper}>
          <div style={STANDARD_STYLES.poeticTextStyle}>
            Perfect cocktail for any occasion!
          </div>
          {false && (
            <div style={STANDARD_STYLES.upgradeRowStyle}>
              <div></div>
              <button 
                style={STANDARD_STYLES.upgradeButtonStyle}
                onClick={handleUpgrade}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                🔥 Upgrade
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Responsive style for container: 100vw on small screens */}
      <style>{`
        @media (max-width: 667px) {
          .responsive-container {
            width: 100vw !important;
            max-width: 100vw !important;
            min-width: 0 !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            border-radius: 0 0 16px 16px !important;
          }
        }
      `}</style>
      <div style={STANDARD_STYLES.containerStyle} className="responsive-container">
        <div style={STANDARD_STYLES.cardStyle}>
          {/* Header - Simple title only for cocktails */}
          <div style={STANDARD_STYLES.headerStyle}>
            <h2 className="card-title">{data.cocktailName}</h2>
          </div>
          {/* Comment section - now using FIXED layout */}
          {renderComment()}
          {/* Content */}
          <div style={STANDARD_STYLES.contentStyle}>
            {/* Ingredients & Instructions Row */}
            <div style={STANDARD_STYLES.detailsStyle} className="ingredients-section method-section">
              {/* Ingredients Column */}
              <div>
                <h4 style={STANDARD_STYLES.ingredientsTitleStyle}>🍹 Ingredients:</h4>
                <ul style={STANDARD_STYLES.ingredientsListStyle} className="ingredients-list">
                  {data.ingredients.map((ingredient, index) => (
                    <li key={index} style={STANDARD_STYLES.ingredientItemStyle}>• {ingredient}</li>
                  ))}
                </ul>
              </div>
              {/* Instructions Column */}
              <div>
                <h4 style={STANDARD_STYLES.instructionsTitleStyle}>⚡ Method:</h4>
                <div style={STANDARD_STYLES.instructionsTextStyle} className="method-content">
                  {data.instructions}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export type { HoroscopeData, CocktailData };
export { CompactCocktailCard };
export default CompactHoroscopeCard;