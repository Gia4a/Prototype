import React, { useState } from 'react';
import STANDARD_STYLES from "./CardStyles";

interface ShooterCocktailData {
  detectedLiquor: string;
  shooter: {
    name: string;
    ingredients: string[];
    instructions: string;
    glassType?: string;
    garnish?: string;
  };
  cocktail: {
    name: string;
    ingredients: string[];
    instructions: string;
    glassType?: string;
    garnish?: string;
  };
}

interface ShooterCocktailCardProps {
  data: ShooterCocktailData;
}

const ShooterCocktailCard: React.FC<ShooterCocktailCardProps> = ({ data }) => {
  const [selectedType, setSelectedType] = useState<'shooter' | 'cocktail'>('shooter');

  // Get current recipe based on selection
  const currentRecipe = selectedType === 'shooter' ? data.shooter : data.cocktail;
  const currentTitle = selectedType === 'shooter' ? data.shooter.name : data.cocktail.name;

  // Button styles for toggle buttons
  const getButtonStyle = (type: 'shooter' | 'cocktail') => ({
    flex: 1,
    padding: '12px 8px',
    border: 'none',
    borderRadius: '6px',
    fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: selectedType === type ? '#dc2626' : '#374151',
    color: selectedType === type ? 'white' : '#d1d5db',
    boxShadow: selectedType === type ? '0 2px 8px rgba(220, 38, 38, 0.3)' : 'none',
    textAlign: 'center' as const,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  });

  // Custom comment section style for toggle buttons
  const toggleSectionStyle = {
    ...STANDARD_STYLES.commentSectionStyle,
    padding: '12px',
    minHeight: '80px',
    maxHeight: '80px',
    height: '80px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
  };

  return (
    <>
      {/* Responsive style for container */}
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
          
          {/* Header with detected liquor */}
          <div style={STANDARD_STYLES.headerStyle}>
            <h2 className="card-title">{currentTitle}</h2>
            <div style={{ 
              fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)', 
              opacity: 0.9, 
              marginTop: '4px' 
            }}>
              📸 Featuring: {data.detectedLiquor}
            </div>
          </div>

          {/* Toggle Button Section (replaces comment section) */}
          <div style={toggleSectionStyle}>
            <div style={{
              fontSize: 'clamp(0.7rem, 2.8vw, 0.85rem)',
              color: '#bfdbfe',
              marginBottom: '6px',
              textAlign: 'center' as const,
              fontStyle: 'italic' as const,
            }}>
              Choose your style from {data.detectedLiquor}
            </div>
            
            {/* Toggle Buttons Row */}
            <div style={{
              display: 'flex',
              gap: '8px',
              width: '100%',
              maxWidth: '280px',
            }}>
              <button
                style={getButtonStyle('shooter')}
                onClick={() => setSelectedType('shooter')}
                onMouseEnter={(e) => {
                  if (selectedType !== 'shooter') {
                    e.currentTarget.style.backgroundColor = '#4b5563';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedType !== 'shooter') {
                    e.currentTarget.style.backgroundColor = '#374151';
                  }
                }}
              >
                🥃 Shooter
              </button>
              <button
                style={getButtonStyle('cocktail')}
                onClick={() => setSelectedType('cocktail')}
                onMouseEnter={(e) => {
                  if (selectedType !== 'cocktail') {
                    e.currentTarget.style.backgroundColor = '#4b5563';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedType !== 'cocktail') {
                    e.currentTarget.style.backgroundColor = '#374151';
                  }
                }}
              >
                🍹 Cocktail
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={STANDARD_STYLES.contentStyle}>
            {/* Ingredients & Instructions Row */}
            <div style={STANDARD_STYLES.detailsStyle} className="ingredients-section method-section">
              
              {/* Ingredients Column */}
              <div>
                <h4 style={STANDARD_STYLES.ingredientsTitleStyle}>
                  {selectedType === 'shooter' ? '🥃' : '🍹'} Ingredients:
                </h4>
                <ul style={STANDARD_STYLES.ingredientsListStyle} className="ingredients-list">
                  {currentRecipe.ingredients.map((ingredient, index) => (
                    <li key={index} style={STANDARD_STYLES.ingredientItemStyle}>
                      • {ingredient}
                    </li>
                  ))}
                </ul>
                {/* Glass type if available */}
                {currentRecipe.glassType && (
                  <div style={{
                    fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)',
                    color: '#9ca3af',
                    marginTop: '6px',
                    fontStyle: 'italic'
                  }}>
                    Serve in: {currentRecipe.glassType}
                  </div>
                )}
              </div>

              {/* Instructions Column */}
              <div>
                <h4 style={STANDARD_STYLES.instructionsTitleStyle}>⚡ Method:</h4>
                <div style={STANDARD_STYLES.instructionsTextStyle} className="method-content">
                  {currentRecipe.instructions}
                </div>
                {/* Garnish if available */}
                {currentRecipe.garnish && (
                  <div style={{
                    fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)',
                    color: '#fbbf24',
                    marginTop: '8px',
                    fontStyle: 'italic'
                  }}>
                    Garnish: {currentRecipe.garnish}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export type { ShooterCocktailData };
export default ShooterCocktailCard;