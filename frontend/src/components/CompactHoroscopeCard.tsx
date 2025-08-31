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

  // FIXED COMMENT SECTION STYLES
  commentSectionStyle: {
    textAlign: 'center',
    fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)',
    lineHeight: '1.4',
    backgroundColor: '#374151',
    borderRadius: '4px',
    padding: '8px',
    flexShrink: 0,
    marginTop: 0,
    // Cocktail-specific overrides
    border: '5px solid rgba(59,130,246,0.18)',
    boxShadow: '0 2px 8px 0 rgba(59,130,246,0.07)',
    // Fixed height to ensure consistent layout
    minHeight: '90px',
    maxHeight: '120px',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: 'visible',
    position: 'relative',
  } as React.CSSProperties,

  // Poetic text at top - fully visible 2 lines
  poeticTextStyle: {
    fontStyle: 'italic',
    color: '#bfdbfe',
    marginBottom: '6px',
    fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)',
    textAlign: 'center',
    lineHeight: '1.3',
    width: '100%',
    wordWrap: 'break-word',
    overflow: 'visible',
    whiteSpace: 'normal',
    display: 'block',
  } as React.CSSProperties,

  personalCommentTextStyle: {
    color: '#d8b4fe',
    fontSize: 'clamp(0.65rem, 2.2vw, 0.75rem)',
    marginBottom: '4px',
    textAlign: 'center',
    width: '100%',
    wordWrap: 'break-word',
    overflow: 'visible',
    display: 'block',
  } as React.CSSProperties,

  // Bartender message - separate row with space for button
  upgradeCommentTextStyle: {
    color: '#fbbf24',
    fontSize: 'clamp(0.65rem, 2.2vw, 0.75rem)',
    fontWeight: '500',
    textAlign: 'left',
    marginTop: '6px',
    width: '78%', // Leave 22% for button (20% + margins)
    wordWrap: 'break-word',
    overflow: 'visible',
    lineHeight: '1.2',
    display: 'block',
    paddingRight: '4px',
  } as React.CSSProperties,

  // Button positioned at same height as text in bottom right
  upgradeButtonStyle: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '3px 6px',
    fontSize: 'clamp(0.6rem, 2vw, 0.7rem)',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    width: '20%',
    minWidth: '60px',
    maxWidth: '120px',
    height: 'calc(clamp(0.65rem, 2.2vw, 0.75rem) * 1.4)', // Match text height
    lineHeight: '1.2',
    zIndex: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  // Wrapper for proper content flow
  commentSectionButtonWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: '90px',
    maxHeight: '120px',
    paddingBottom: '0px',
  } as React.CSSProperties,

  // Row wrapper for bartender text + button
  upgradeRowStyle: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '6px',
    position: 'relative',
    minHeight: 'calc(clamp(0.65rem, 2.2vw, 0.75rem) * 1.4)',
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
    fontSize: '1.1rem'
  } as React.CSSProperties,

  ingredientsListStyle: {
    fontSize: '0.9rem',
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
    fontSize: '1.1rem'
  } as React.CSSProperties,

  instructionsTextStyle: {
    fontSize: '1rem',
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
    </>
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

  // Render comment content based on type - FIXED LAYOUT
  const renderComment = () => {
    if (typeof data.comment === 'string') {
      // Parse string comment to separate poetic lines from bartender message
      const parts = data.comment.split(/\n\n.*1920s Bartender.*|".*?" - Your.*Mixologist/);
      const mainComment = parts[0];
      const lines = mainComment.split('\n');
      // Extract bartender/upgrade message
      let upgradeText = '';
      const bartenderMatch = data.comment.match(/".*?" - Your.*?(?:Bartender|Mixologist)/);
      if (bartenderMatch) {
        upgradeText = bartenderMatch[0];
      }
      return (
        <div style={STANDARD_STYLES.commentSectionStyle}>
          <div style={STANDARD_STYLES.commentSectionButtonWrapper}>
            {/* Poetic lines at top - fully visible */}
            <div style={STANDARD_STYLES.poeticTextStyle}>
              {lines.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
            {/* Bartender message + button row */}
            <div style={STANDARD_STYLES.upgradeRowStyle}>
              <div style={STANDARD_STYLES.upgradeCommentTextStyle}>
                {upgradeText || '"Ready for an upgrade?" - Your Mixologist'}
              </div>
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
            
            {/* Personal comment */}
            {data.comment.personalComment && (
              <div style={STANDARD_STYLES.personalCommentTextStyle}>
                {data.comment.personalComment}
              </div>
            )}
            
            {/* Bartender message + button row */}
            {(data.comment.upgradeComment || shouldShowUpgrade) && (
              <div style={STANDARD_STYLES.upgradeRowStyle}>
                <div style={STANDARD_STYLES.upgradeCommentTextStyle}>
                  {data.comment.upgradeComment || '"Ready for an upgrade?" - Your Mixologist'}
                </div>
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
          {shouldShowUpgrade && (
            <div style={STANDARD_STYLES.upgradeRowStyle}>
              <div style={STANDARD_STYLES.upgradeCommentTextStyle}>
                "Ready for an upgrade?" - Your Mixologist
              </div>
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
            <h2 style={STANDARD_STYLES.titleStyle} className="horoscope-header-special">
              {data.cocktailName}
            </h2>
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