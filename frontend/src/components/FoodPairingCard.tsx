import React, { useState } from 'react';

import STANDARD_STYLES from "./CardStyles";

export interface FoodPairingData {
  dishName: string;
  winePairing: {
    name: string;
    notes: string;
  };
  spiritPairing: {
    name: string;
    notes: string;
  };
  beerPairing: {
    name: string;
    notes: string;
  };
  comment?: string;
}

interface FoodPairingCardProps {
  data: FoodPairingData;
}

const FoodPairingCard: React.FC<FoodPairingCardProps> = ({ data }) => {
  const [selectedPairing, setSelectedPairing] = useState<'wine' | 'spirit' | 'beer'>('wine');

  const getCurrentPairing = () => {
    switch (selectedPairing) {
      case 'wine':
        return data.winePairing;
      case 'spirit':
        return data.spiritPairing;
      case 'beer':
        return data.beerPairing;
      default:
        return data.winePairing;
    }
  };

  const getCurrentPairingEmoji = () => {
    switch (selectedPairing) {
      case 'wine':
        return '🍷';
      case 'spirit':
        return '🥃';
      case 'beer':
        return '🍺';
      default:
        return '🍷';
    }
  };

  return (
    <>
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
            <h2 className="card-title" style={STANDARD_STYLES.titleStyle}>Pairing for {data.dishName}</h2>
          </div>

          {/* Comment Section - Now contains the pairing selection buttons */}
          <div style={{
            ...STANDARD_STYLES.commentSectionStyle,
            minHeight: '14.4%', // Reduced by 40% from 24%
            maxHeight: '14.4%'
          }}>
            <div style={STANDARD_STYLES.commentSectionButtonWrapper}>
              {/* Pairing Selection Buttons */}
              <div style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '8px' }}>
                <button
                  onClick={() => setSelectedPairing('wine')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: selectedPairing === 'wine' ? '#a78bfa' : '#374151',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s'
                  }}
                >
                  🍷 Wine
                </button>
                <button
                  onClick={() => setSelectedPairing('spirit')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: selectedPairing === 'spirit' ? '#fbbf24' : '#374151',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s'
                  }}
                >
                  🥃 Spirit
                </button>
                <button
                  onClick={() => setSelectedPairing('beer')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: selectedPairing === 'beer' ? '#fb923c' : '#374151',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s'
                  }}
                >
                  🍺 Beer
                </button>
              </div>

              {/* Selected Pairing Name */}
              <div style={STANDARD_STYLES.poeticTextStyle}>
                {getCurrentPairingEmoji()} {getCurrentPairing().name}
              </div>
            </div>
          </div>

          {/* Content - Now contains the pairing details */}
          <div style={STANDARD_STYLES.contentStyle}>
            {/* Pairing Details - using the method section style */}
            <div style={{ ...STANDARD_STYLES.detailsStyle, gridTemplateColumns: '1fr' }}>
              <div>
                <h4 style={STANDARD_STYLES.instructionsTitleStyle}>
                  {getCurrentPairingEmoji()} Pairing Notes:
                </h4>
                <div style={{
                  ...STANDARD_STYLES.instructionsTextStyle,
                  fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)', // Responsive font size
                  lineHeight: '1.3', // Tighter line height
                  overflow: 'hidden', // Prevent any overflow
                  wordBreak: 'break-word', // Break long words
                  hyphens: 'auto' // Enable hyphenation
                }}>
                  {getCurrentPairing().notes}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FoodPairingCard;