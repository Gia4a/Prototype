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
  // STANDARDIZED container to match horoscope-grid-container dimensions
  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '600px',
    height: '400px', // Match horoscope-grid-container height
    backgroundColor: '#111827',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    boxSizing: 'border-box',
    margin: '0 auto'
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    backgroundColor: '#1f2937',
    borderRadius: '8px',
    border: '1px solid #3b82f6',
    overflow: 'visible', // Changed from hidden to visible
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(to right, #2563eb, #9333ea)',
    padding: '12px',
    textAlign: 'center',
    flexShrink: 0
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    margin: '0',
    textShadow: '0px 4px 8px rgba(0, 0, 0, 0.7)',
    color: 'white'
  };

  const contentStyle: React.CSSProperties = {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px', // Reduced gap for better space utilization
    flex: 1,
    overflow: 'visible', // Changed from hidden to visible
    minHeight: 0
  };

  const descriptionStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '0.8rem', // Slightly smaller for more space
    lineHeight: '1.4', // Tighter line height
    backgroundColor: '#374151',
    borderRadius: '4px',
    padding: '6px', // Reduced padding
    flexShrink: 0
  };

  const insightStyle: React.CSSProperties = {
    fontStyle: 'italic',
    color: '#bfdbfe',
    margin: '0'
  };

  const themeStyle: React.CSSProperties = {
    color: '#d8b4fe',
    fontSize: '0.7rem', // Smaller theme text
    marginTop: '2px',
    display: 'block'
  };

  const detailsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr', // More balanced columns
    gap: '8px',
    fontSize: '0.8rem', // Slightly smaller base font
    flex: 1,
    minHeight: 0,
    overflow: 'visible'
  };

  const ingredientsTitleStyle: React.CSSProperties = {
    fontWeight: '600',
    color: '#4ade80',
    marginBottom: '4px',
    marginTop: '0',
    fontSize: '0.8rem'
  };

  const ingredientsListStyle: React.CSSProperties = {
    fontSize: '0.7rem', // Smaller ingredient text
    margin: '0',
    padding: '0',
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px', // Tighter spacing
    overflow: 'visible', // Allow all ingredients to show
    maxHeight: 'none' // Remove height restrictions
  };

  const ingredientItemStyle: React.CSSProperties = {
    color: '#d1d5db',
    lineHeight: '1.3',
    overflow: 'visible', // Show full ingredient text
    whiteSpace: 'normal', // Allow wrapping if needed
    wordBreak: 'break-word' // Break long words if necessary
  };

  const instructionsTitleStyle: React.CSSProperties = {
    fontWeight: '600',
    color: '#fb923c',
    marginBottom: '4px',
    marginTop: '0',
    fontSize: '0.8rem'
  };

  const instructionsTextStyle: React.CSSProperties = {
    fontSize: '0.7rem', // Smaller instruction text
    color: '#d1d5db',
    lineHeight: '1.4',
    margin: '0',
    overflow: 'visible', // Show all instructions
    maxHeight: 'none', // Remove height restrictions
    display: 'block', // Remove webkit-box restrictions
    whiteSpace: 'normal',
    wordBreak: 'break-word'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle} className="horoscope-header-special">
            {data.cocktailName}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <span>🌙 {data.moonPhase}</span>
            <span>🪐 {data.ruler}</span>
          </div>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Description */}
          <div style={descriptionStyle}>
            <p style={insightStyle}>
              {data.insight}
              <br />
              <span style={themeStyle}>
                {data.theme}
              </span>
            </p>
          </div>

          {/* Ingredients & Instructions Row */}
          <div style={detailsStyle} className="ingredients-section method-section">
            {/* Ingredients Column */}
            <div>
              <h4 style={ingredientsTitleStyle}>🍹 Ingredients:</h4>
              <ul style={ingredientsListStyle} className="ingredients-list">
                {data.ingredients.map((ingredient, index) => (
                  <li key={index} style={ingredientItemStyle}>• {ingredient}</li>
                ))}
              </ul>
            </div>

            {/* Instructions Column */}
            <div>
              <h4 style={instructionsTitleStyle}>⚡ Method:</h4>
              <div style={instructionsTextStyle} className="method-content">
                {data.instructions}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced CocktailData interface with upgrade functionality
interface CocktailData {
  cocktailName: string;
  ingredients: string[];
  instructions: string;
  comment: string | {
    poeticDescription?: string;
    personalComment?: string;
    upgradeComment?: string;
  }; // Can be string or structured comment object
  originalQuery?: string; // For upgrade functionality
  onUpgrade?: (upgradeType: string) => void; // Callback for upgrade button
}

interface CompactCocktailCardProps {
  data: CocktailData;
}

const CompactCocktailCard: React.FC<CompactCocktailCardProps> = ({ data }) => {
  // STANDARDIZED container to match horoscope-grid-container dimensions
  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '600px',
    height: '400px', // Match horoscope-grid-container height
    backgroundColor: '#111827',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    boxSizing: 'border-box',
    margin: '0 auto'
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    backgroundColor: '#1f2937',
    borderRadius: '8px',
    border: '1px solid #3b82f6',
    overflow: 'visible', // Changed from hidden to visible
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(to right, #2563eb, #9333ea)',
    padding: '12px',
    textAlign: 'center',
    flexShrink: 0
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    margin: '0',
    textShadow: '0px 4px 8px rgba(0, 0, 0, 0.7)',
    color: 'white'
  };

  const contentStyle: React.CSSProperties = {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px', // Further reduced for upgrade button space
    flex: 1,
    overflow: 'visible',
    minHeight: 0
  };

  const commentStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '0.75rem',
    lineHeight: '1.3',
    backgroundColor: '#374151',
    borderRadius: '4px',
    padding: '6px',
    flexShrink: 0
  };

  const poeticStyle: React.CSSProperties = {
    fontStyle: 'italic',
    color: '#bfdbfe',
    marginBottom: '4px',
    fontSize: '0.8rem'
  };

  const personalCommentStyle: React.CSSProperties = {
    color: '#d8b4fe',
    fontSize: '0.7rem',
    marginBottom: '2px'
  };

  const upgradeCommentStyle: React.CSSProperties = {
    color: '#fbbf24',
    fontSize: '0.7rem',
    fontWeight: '500'
  };

  const upgradeButtonStyle: React.CSSProperties = {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    marginTop: '4px',
    alignSelf: 'center',
    transition: 'background-color 0.2s'
  };

  const detailsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '8px',
    fontSize: '0.8rem',
    flex: 1,
    minHeight: 0,
    overflow: 'visible'
  };

  const ingredientsTitleStyle: React.CSSProperties = {
    fontWeight: '600',
    color: '#4ade80',
    marginBottom: '4px',
    marginTop: '0',
    fontSize: '0.8rem'
  };

  const ingredientsListStyle: React.CSSProperties = {
    fontSize: '0.7rem',
    margin: '0',
    padding: '0',
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    overflow: 'visible',
    maxHeight: 'none'
  };

  const ingredientItemStyle: React.CSSProperties = {
    color: '#d1d5db',
    lineHeight: '1.3',
    overflow: 'visible',
    whiteSpace: 'normal',
    wordBreak: 'break-word'
  };

  const instructionsTitleStyle: React.CSSProperties = {
    fontWeight: '600',
    color: '#fb923c',
    marginBottom: '4px',
    marginTop: '0',
    fontSize: '0.8rem'
  };

  const instructionsTextStyle: React.CSSProperties = {
    fontSize: '0.7rem',
    color: '#d1d5db',
    lineHeight: '1.4',
    margin: '0',
    overflow: 'visible',
    maxHeight: 'none',
    display: 'block',
    whiteSpace: 'normal',
    wordBreak: 'break-word'
  };


  // Handle upgrade button click
  const handleUpgrade = () => {
    if (data.onUpgrade) {
      const upgradeTypes = ['seasonal', 'spicy', 'premium', 'festive'];
      const randomUpgrade = upgradeTypes[Math.floor(Math.random() * upgradeTypes.length)];
      data.onUpgrade(randomUpgrade);
    }
  };

  // Determine if upgrade functionality should be available
  const shouldShowUpgrade = data.onUpgrade && data.originalQuery;

  // Render comment content based on type
  const renderComment = () => {
    if (typeof data.comment === 'string') {
      // Legacy string comment
      return <div style={{ ...commentStyle, fontStyle: 'italic', color: '#bfdbfe' }}>{data.comment}</div>;
    }

    if (data.comment && typeof data.comment === 'object') {
      // New structured comment
      return (
        <div style={commentStyle}>
          {data.comment.poeticDescription && (
            <div style={poeticStyle}>
              {data.comment.poeticDescription.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}
          {data.comment.personalComment && (
            <div style={personalCommentStyle}>
              {data.comment.personalComment}
            </div>
          )}
          {data.comment.upgradeComment && shouldShowUpgrade && (
            <div>
              <div style={upgradeCommentStyle}>
                {data.comment.upgradeComment}
              </div>
              <button 
                style={upgradeButtonStyle}
                onClick={handleUpgrade}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                🔥 Upgrade Recipe
              </button>
            </div>
          )}
        </div>
      );
    }

    return <div style={commentStyle}>Perfect cocktail for any occasion!</div>;
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header - Simple title only for cocktails */}
        <div style={headerStyle}>
          <h2 style={titleStyle} className="horoscope-header-special">
            {data.cocktailName}
          </h2>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Enhanced comment section */}
          {renderComment()}

          {/* Ingredients & Instructions Row */}
          <div style={detailsStyle} className="ingredients-section method-section">
            {/* Ingredients Column */}
            <div>
              <h4 style={ingredientsTitleStyle}>🍹 Ingredients:</h4>
              <ul style={ingredientsListStyle} className="ingredients-list">
                {data.ingredients.map((ingredient, index) => (
                  <li key={index} style={ingredientItemStyle}>• {ingredient}</li>
                ))}
              </ul>
            </div>

            {/* Instructions Column */}
            <div>
              <h4 style={instructionsTitleStyle}>⚡ Method:</h4>
              <div style={instructionsTextStyle} className="method-content">
                {data.instructions}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export type { HoroscopeData, CocktailData };
export { CompactCocktailCard };
export default CompactHoroscopeCard;