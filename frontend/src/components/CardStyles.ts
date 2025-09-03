// CardStyles.ts
// Shared style object for CompactHoroscopeCard and FoodPairingCard - Mobile Optimized

const STANDARD_STYLES = {
  containerStyle: {
    width: '100%',
    maxWidth: '432px', // Match your mobile frame width
    height: '100%', // Inherit from parent container
    maxHeight: '100%', // Inherit from parent container
    backgroundColor: '#111827',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    boxSizing: 'border-box',
    margin: '0 auto',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
  } as React.CSSProperties,

  cardStyle: {
    width: '100%',
    height: '100%', // Fill parent container
    maxWidth: '100%',
    backgroundColor: '#1f2937',
    borderRadius: '8px',
    border: '1px solid #3b82f6',
    overflow: 'hidden', // Changed from visible to hidden
    display: 'flex',
    flexDirection: 'column'
  } as React.CSSProperties,

  headerStyle: {
    background: 'linear-gradient(to right, #2563eb, #9333ea)',
    padding: '10px',
    textAlign: 'center',
    flexShrink: 0,
    marginBottom: '8px',
    maxHeight: '12%', // Reduced from 15%
    minHeight: '60px'
  } as React.CSSProperties,

  titleStyle: {
    fontSize: 'clamp(1rem, 4vw, 1.8rem)', // More responsive sizing
    fontWeight: 'bold',
    margin: '0',
    textShadow: '0px 4px 8px rgba(0, 0, 0, 0.7)',
    color: 'white',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    overflow: 'hidden',
    height: '100%',
    minHeight: 0, // Important for flex overflow
  } as React.CSSProperties,

  // OPTIMIZED COMMENT SECTION STYLES FOR MOBILE
  commentSectionStyle: {
    textAlign: 'center',
    fontSize: 'clamp(0.65rem, 3vw, 0.75rem)',
    lineHeight: '1.3',
    backgroundColor: '#374151',
    borderRadius: '4px',
    padding: '8px',
    flexShrink: 0,
    marginTop: 0,
    border: '3px solid rgba(59,130,246,0.18)',
    boxShadow: '0 2px 8px 0 rgba(59,130,246,0.07)',
    minHeight: '20%', // Reduced from 24%
    maxHeight: '20%',
    height: '20%',
    position: 'relative',
    overflow: 'hidden', // Changed from visible to hidden
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  } as React.CSSProperties,

  // Poetic text at top - more compact
  poeticTextStyle: {
    fontStyle: 'italic',
    color: '#bfdbfe',
    marginBottom: '4px',
    fontSize: 'clamp(0.65rem, 2.8vw, 0.75rem)',
    textAlign: 'center',
    lineHeight: '1.25',
    width: '100%',
    wordWrap: 'break-word',
    overflow: 'hidden',
    whiteSpace: 'normal',
    display: 'block',
    maxHeight: '3.75em', // Limit to ~3 lines
    textOverflow: 'ellipsis',
  } as React.CSSProperties,

  personalCommentTextStyle: {
    color: '#d8b4fe',
    fontSize: 'clamp(0.6rem, 2.5vw, 0.7rem)',
    marginBottom: '3px',
    textAlign: 'center',
    width: '100%',
    wordWrap: 'break-word',
    overflow: 'hidden',
    display: 'block',
    maxHeight: '2.5em',
    lineHeight: '1.25',
  } as React.CSSProperties,

  // Optimized button for mobile
  upgradeButtonStyle: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: 'clamp(0.6rem, 2.2vw, 0.7rem)',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    position: 'absolute',
    bottom: '6px',
    right: '6px',
    width: '22%',
    minWidth: '65px',
    maxWidth: '90px',
    height: '24px',
    lineHeight: '1',
    zIndex: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
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
    minHeight: '80px',
    maxHeight: '100px',
    paddingBottom: '0px',
    overflow: 'hidden',
  } as React.CSSProperties,

  // Row wrapper for bartender text + button
  upgradeRowStyle: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '4px',
    position: 'relative',
    minHeight: '20px',
    maxHeight: '25px',
    overflow: 'hidden',
  } as React.CSSProperties,

  detailsStyle: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '8px',
    fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden', // Prevent overflow
    height: '100%',
  } as React.CSSProperties,

  ingredientsTitleStyle: {
    fontWeight: '600',
    color: '#4ade80',
    marginBottom: '4px',
    marginTop: '0',
    fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
    lineHeight: '1.2',
  } as React.CSSProperties,

  ingredientsListStyle: {
    fontSize: 'clamp(0.75rem, 2.8vw, 0.9rem)',
    margin: '0',
    padding: '0',
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    overflow: 'hidden', // Prevent overflow
    maxHeight: '100%',
    height: '100%',
  } as React.CSSProperties,

  ingredientItemStyle: {
    color: '#d1d5db',
    lineHeight: '1.25',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    wordBreak: 'break-word',
    fontSize: 'inherit',
  } as React.CSSProperties,

  instructionsTitleStyle: {
    fontWeight: '600',
    color: '#fb923c',
    marginBottom: '4px',
    marginTop: '0',
    fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
    lineHeight: '1.2',
  } as React.CSSProperties,

  instructionsTextStyle: {
    fontSize: 'clamp(0.75rem, 2.8vw, 1rem)',
    color: '#d1d5db',
    lineHeight: '1.3',
    margin: '0',
    overflow: 'hidden',
    maxHeight: '100%',
    display: 'block',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    textOverflow: 'ellipsis',
  } as React.CSSProperties
};

export default STANDARD_STYLES;