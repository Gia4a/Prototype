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
    overflow: 'hidden',
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
    gap: '12px',
    flex: 1,
    overflow: 'hidden'
  };

  const descriptionStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '0.875rem',
    lineHeight: '1.625',
    backgroundColor: '#374151',
    borderRadius: '4px',
    padding: '8px',
    flexShrink: 0
  };

  const insightStyle: React.CSSProperties = {
    fontStyle: 'italic',
    color: '#bfdbfe',
    margin: '0'
  };

  const themeStyle: React.CSSProperties = {
    color: '#d8b4fe',
    fontSize: '0.75rem',
    marginTop: '4px',
    display: 'block'
  };

  const detailsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 3fr',
    gap: '8px',
    fontSize: '0.875rem',
    flex: 1,
    minHeight: 0
  };

  const ingredientsTitleStyle: React.CSSProperties = {
    fontWeight: '600',
    color: '#4ade80',
    marginBottom: '4px',
    marginTop: '0',
    fontSize: 'inherit'
  };

  const ingredientsListStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    margin: '0',
    padding: '0',
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'hidden'
  };

  const ingredientItemStyle: React.CSSProperties = {
    color: '#d1d5db',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const instructionsTitleStyle: React.CSSProperties = {
    fontWeight: '600',
    color: '#fb923c',
    marginBottom: '4px',
    marginTop: '0',
    fontSize: 'inherit'
  };

  const instructionsTextStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#d1d5db',
    lineHeight: '1.625',
    margin: '0',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            {data.cocktailName}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
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
          <div style={detailsStyle}>
            {/* Ingredients Column */}
            <div>
              <h4 style={ingredientsTitleStyle}>🍹 Ingredients:</h4>
              <ul style={ingredientsListStyle}>
                {data.ingredients.map((ingredient, index) => (
                  <li key={index} style={ingredientItemStyle}>• {ingredient}</li>
                ))}
              </ul>
            </div>

            {/* Instructions Column */}
            <div>
              <h4 style={instructionsTitleStyle}>⚡ Method:</h4>
              <p style={instructionsTextStyle}>
                {data.instructions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Also create the CocktailData interface and CompactCocktailCard component in the same file
// since you said not to create new files
interface CocktailData {
  cocktailName: string;
  ingredients: string[];
  instructions: string;
  comment: string; // This replaces insight for regular cocktails
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
    overflow: 'hidden',
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
    gap: '12px',
    flex: 1,
    overflow: 'hidden'
  };

  const commentStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '0.875rem',
    lineHeight: '1.625',
    backgroundColor: '#374151',
    borderRadius: '4px',
    padding: '8px',
    flexShrink: 0,
    fontStyle: 'italic',
    color: '#bfdbfe'
  };

  const detailsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 3fr',
    gap: '8px',
    fontSize: '0.875rem',
    flex: 1,
    minHeight: 0
  };

  const ingredientsTitleStyle: React.CSSProperties = {
    fontWeight: '600',
    color: '#4ade80',
    marginBottom: '4px',
    marginTop: '0',
    fontSize: 'inherit'
  };

  const ingredientsListStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    margin: '0',
    padding: '0',
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'hidden'
  };

  const ingredientItemStyle: React.CSSProperties = {
    color: '#d1d5db',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const instructionsTitleStyle: React.CSSProperties = {
    fontWeight: '600',
    color: '#fb923c',
    marginBottom: '4px',
    marginTop: '0',
    fontSize: 'inherit'
  };

  const instructionsTextStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#d1d5db',
    lineHeight: '1.625',
    margin: '0',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header - Simple title only for cocktails */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            {data.cocktailName}
          </h2>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Comment section */}
          <div style={commentStyle}>
            {data.comment}
          </div>

          {/* Ingredients & Instructions Row */}
          <div style={detailsStyle}>
            {/* Ingredients Column */}
            <div>
              <h4 style={ingredientsTitleStyle}>🍹 Ingredients:</h4>
              <ul style={ingredientsListStyle}>
                {data.ingredients.map((ingredient, index) => (
                  <li key={index} style={ingredientItemStyle}>• {ingredient}</li>
                ))}
              </ul>
            </div>

            {/* Instructions Column */}
            <div>
              <h4 style={instructionsTitleStyle}>⚡ Method:</h4>
              <p style={instructionsTextStyle}>
                {data.instructions}
              </p>
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