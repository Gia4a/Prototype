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
  originalQuery?: string;
  onUpgrade?: (upgradeType: string) => void;
}

interface CompactCocktailCardProps {
  data: CocktailData;
}

// STANDARDIZED STYLES - Single source of truth for all cards
const STANDARD_STYLES = {
  containerStyle: {
    width: '667px',
    maxWidth: '667px',
    height: '60vh',
    maxHeight: '60vh',
    backgroundColor: '#111827',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    boxSizing: 'border-box',
    margin: '40px auto',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
  } as React.CSSProperties,

  cardStyle: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    backgroundColor: '#1f2937',
    borderRadius: '8px',
    border: '1px solid #3b82f6',
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column'
  } as React.CSSProperties,

  headerStyle: {
    background: 'linear-gradient(to right, #2563eb, #9333ea)',
    padding: '12px',
    textAlign: 'center',
    flexShrink: 0,
    marginBottom: '10px',
    maxHeight: '15%'
  } as React.CSSProperties,

  titleStyle: {
    fontSize: 'min(2rem, max(0.7rem, 8vw))',
    fontWeight: 'bold',
    margin: '0',
    textShadow: '0px 4px 8px rgba(0, 0, 0, 0.7)',
    color: 'white',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: '100%',
    width: '100%',
    lineHeight: 1.2,
    minWidth: 0,
    fontFamily: 'inherit',
    display: 'block',
    letterSpacing: '0.01em',
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    verticalAlign: 'middle',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  contentStyle: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    overflow: 'hidden',
    height: '100%',
  } as React.CSSProperties,

  // CONSOLIDATED COMMENT SECTION STYLES
  commentSectionStyle: {
    textAlign: 'center',
    fontSize: '0.8rem',
    lineHeight: '1.4',
    backgroundColor: '#374151',
    borderRadius: '4px',
    padding: '6px',
    flexShrink: 0,
    marginTop: 0,
    // Cocktail-specific overrides
    border: '5px solid rgba(59,130,246,0.18)',
    boxShadow: '0 2px 8px 0 rgba(59,130,246,0.07)',
    // Adjustable height - change this value to control comment section height
    minHeight: '80px',
    maxHeight: '120px',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties,

  // Simplified comment content styles
  poeticTextStyle: {
    fontStyle: 'italic',
    color: '#bfdbfe',
    marginBottom: '4px',
    fontSize: '0.8rem',
    textAlign: 'center',
    lineHeight: '1.3',
  } as React.CSSProperties,

  personalCommentTextStyle: {
    color: '#d8b4fe',
    fontSize: '0.7rem',
    marginBottom: '2px',
    textAlign: 'center',
  } as React.CSSProperties,

  upgradeCommentTextStyle: {
    color: '#fbbf24',
    fontSize: '0.7rem',
    fontWeight: '500',
    textAlign: 'center',
  } as React.CSSProperties,

  upgradeButtonStyle: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'background-color 0.2s'
  } as React.CSSProperties,

  detailsStyle: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '8px',
    fontSize: '0.8rem',
    flex: 1,
    minHeight: 0,
    overflow: 'visible'
  } as React.CSSProperties,

  ingredientsTitleStyle: {
    fontWeight: '600',
    color: '#4ade80',
    marginBottom: '4px',
    marginTop: '0',
    fontSize: '0.8rem'
  } as React.CSSProperties,

  ingredientsListStyle: {
    fontSize: '0.7rem',
    margin: '0',
    padding: '0',
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    overflow: 'visible',
    maxHeight: 'none'
  } as React.CSSProperties,

  ingredientItemStyle: {
    color: '#d1d5db',
    lineHeight: '1.3',
    overflow: 'visible',
    whiteSpace: 'normal',
    wordBreak: 'break-word'
  } as React.CSSProperties,

  instructionsTitleStyle: {
    fontWeight: '600',
    color: '#fb923c',
    marginBottom: '4px',
    marginTop: '0',
    fontSize: '0.8rem'
  } as React.CSSProperties,

  instructionsTextStyle: {
    fontSize: '0.7rem',
    color: '#d1d5db',
    lineHeight: '1.4',
    margin: '0',
    overflow: 'visible',
    maxHeight: 'none',
    display: 'block',
    whiteSpace: 'normal',
    wordBreak: 'break-word'
  } as React.CSSProperties
};

const CompactHoroscopeCard: React.FC<CompactHoroscopeCardProps> = ({ data }) => {
  return (
    <div style={STANDARD_STYLES.containerStyle}>
      <div style={STANDARD_STYLES.cardStyle}>
        {/* Header */}
        <div style={STANDARD_STYLES.headerStyle}>
          <h2 style={STANDARD_STYLES.titleStyle} className="horoscope-header-special">
            {data.cocktailName}
          </h2>
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
            <div style={STANDARD_STYLES.personalCommentTextStyle}>
              {data.theme}
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
  );
};

const CompactCocktailCard: React.FC<CompactCocktailCardProps> = ({ data }) => {
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
      return (
        <div style={STANDARD_STYLES.commentSectionStyle}>
          <div style={STANDARD_STYLES.poeticTextStyle}>
            {data.comment}
          </div>
        </div>
      );
    }

    if (data.comment && typeof data.comment === 'object') {
      // New structured comment
      return (
        <div style={STANDARD_STYLES.commentSectionStyle}>
          {data.comment.poeticDescription && (
            <div style={STANDARD_STYLES.poeticTextStyle}>
              {data.comment.poeticDescription.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}
          {data.comment.personalComment && (
            <div style={STANDARD_STYLES.personalCommentTextStyle}>
              {data.comment.personalComment}
            </div>
          )}
          {data.comment.upgradeComment && shouldShowUpgrade && (
            <div>
              <div style={STANDARD_STYLES.upgradeCommentTextStyle}>
                {data.comment.upgradeComment}
              </div>
              <button 
                style={STANDARD_STYLES.upgradeButtonStyle}
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

    return (
      <div style={STANDARD_STYLES.commentSectionStyle}>
        <div style={STANDARD_STYLES.poeticTextStyle}>
          Perfect cocktail for any occasion!
        </div>
      </div>
    );
  };

  return (
    <div style={STANDARD_STYLES.containerStyle}>
      <div style={STANDARD_STYLES.cardStyle}>
        {/* Header - Simple title only for cocktails */}
        <div style={STANDARD_STYLES.headerStyle}>
          <h2 style={STANDARD_STYLES.titleStyle} className="horoscope-header-special">
            {data.cocktailName}
          </h2>
        </div>
        {/* Comment section - now using consolidated styles */}
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
  );
};

export type { HoroscopeData, CocktailData };
export { CompactCocktailCard };
export default CompactHoroscopeCard;