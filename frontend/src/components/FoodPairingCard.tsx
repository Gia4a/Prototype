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
          {/* Pairing Selection Buttons and Pairing Rows inside the same container */}
          <div
            style={{
              ...STANDARD_STYLES.commentSectionStyle,
              overflow: 'hidden',
              margin: 2,
              marginBottom: 8,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 12,
              paddingBottom: 6 // slightly reduced extra space for last row
            }}
          >
            <button
              onClick={() => setSelectedPairing('wine')}
              style={{
                width: '100%',
                height: '8%',
                paddingTop: 0,
                paddingBottom: 0,
                borderRadius: 6,
                border: 'none',
                background: selectedPairing === 'wine' ? '#a78bfa' : '#374151',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1.1rem',
                transition: 'background 0.2s'
              }}
            >Wine</button>
            <button
              onClick={() => setSelectedPairing('spirit')}
              style={{
                width: '100%',
                height: '8%',
                paddingTop: 0,
                paddingBottom: 0,
                borderRadius: 6,
                border: 'none',
                background: selectedPairing === 'spirit' ? '#fbbf24' : '#374151',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1.1rem',
                transition: 'background 0.2s'
              }}
            >Spirit</button>
            <button
              onClick={() => setSelectedPairing('beer')}
              style={{
                width: '100%',
                height: '8%',
                paddingTop: 0,
                paddingBottom: 0,
                borderRadius: 6,
                border: 'none',
                background: selectedPairing === 'beer' ? '#fb923c' : '#374151',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1.1rem',
                transition: 'background 0.2s'
              }}
            >Beer</button>

            {/* Row-based Layout Container - now inside commentSectionStyle */}
            <div style={{ ...STANDARD_STYLES.contentStyle, marginTop: 16, background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}>
              {/* Wine Pairing Row */}
              <div 
                className={`flex items-center p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedPairing === 'wine' 
                    ? 'bg-purple-700 ring-2 ring-purple-400 shadow-xl' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                // onClick removed from row, now handled by buttons above
              >
                <div className="flex items-center gap-4 min-w-[200px]">
                  <span className="text-3xl">🍷</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Wine Pairing</h3>
                    <p className="text-sm text-gray-300">Click to view details</p>
                  </div>
                </div>
                <div className="flex-1 ml-6">
                  {selectedPairing === 'wine' ? (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-purple-300">{data.winePairing.name}</h4>
                      <p className="text-gray-200 leading-relaxed">{data.winePairing.notes}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-yellow-400 text-sm">★</span>
                          ))}
                        </div>
                        <span className="text-gray-400 text-sm">Highly Recommended</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <span className="font-medium">{data.winePairing.name}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Spirit Pairing Row */}
              <div 
                className={`flex items-center p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedPairing === 'spirit' 
                    ? 'bg-amber-700 ring-2 ring-amber-400 shadow-xl' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                // onClick removed from row, now handled by buttons above
              >
                <div className="flex items-center gap-4 min-w-[200px]">
                  <span className="text-3xl">🥃</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Spirit Pairing</h3>
                    <p className="text-sm text-gray-300">Click to view details</p>
                  </div>
                </div>
                <div className="flex-1 ml-6">
                  {selectedPairing === 'spirit' ? (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-amber-300">{data.spiritPairing.name}</h4>
                      <p className="text-gray-200 leading-relaxed">{data.spiritPairing.notes}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-yellow-400 text-sm">★</span>
                          ))}
                        </div>
                        <span className="text-gray-400 text-sm">Highly Recommended</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <span className="font-medium">{data.spiritPairing.name}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Beer Pairing Row */}
              <div 
                className={`flex items-center p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedPairing === 'beer' 
                    ? 'bg-orange-700 ring-2 ring-orange-400 shadow-xl' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                // onClick removed from row, now handled by buttons above
              >
                <div className="flex items-center gap-4 min-w-[200px]">
                  <span className="text-3xl">🍺</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Craft Beer Pairing</h3>
                    <p className="text-sm text-gray-300">Click to view details</p>
                  </div>
                </div>
                <div className="flex-1 ml-6">
                  {selectedPairing === 'beer' ? (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-orange-300">{data.beerPairing.name}</h4>
                      <p className="text-gray-200 leading-relaxed">{data.beerPairing.notes}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-yellow-400 text-sm">★</span>
                          ))}
                        </div>
                        <span className="text-gray-400 text-sm">Highly Recommended</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <span className="font-medium">{data.beerPairing.name}</span>
                    </div>
                  )}
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