// CardStyles.ts
// Shared style object for CompactHoroscopeCard and FoodPairingCard

const STANDARD_STYLES = {
  containerStyle: {
    width: '100%',
    maxWidth: '2048px',
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
    border: '5px solid rgba(59,130,246,0.18)',
    boxShadow: '0 2px 8px 0 rgba(59,130,246,0.07)',
    minHeight: '24%',
    maxHeight: '24%',
    height: '100%',
    position: 'relative',
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
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
    height: 'calc(clamp(0.65rem, 2.2vw, 0.75rem) * 1.4)',
    lineHeight: '1.2',
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

export default STANDARD_STYLES;
