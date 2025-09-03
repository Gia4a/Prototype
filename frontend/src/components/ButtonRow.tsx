import React from 'react';
import StarButton from '../StarButton';

// Eye icon component with blinking animation
const EyeIcon = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
    <div
        onClick={disabled ? undefined : onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            width: 120,
            height: 80,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            borderRadius: '60px / 40px', // Oval shape
            border: 'none',
            boxShadow: 'none',
            transition: 'transform 0.3s ease',
            padding: 0,
        }}
        onMouseEnter={(e) => {
            if (!disabled) {
                e.currentTarget.style.transform = 'scale(1.1)';
            }
        }}
        onMouseLeave={(e) => {
            if (!disabled) {
                e.currentTarget.style.transform = 'scale(1)';
            }
        }}
    >
        <div style={{
            position: 'relative',
            width: '60px',
            height: '35px',
            background: '#fff',
            borderRadius: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            animation: 'eyeBlink 3s infinite'
        }}>
            {/* Iris */}
            <div style={{
                width: '24px',
                height: '24px',
                background: 'radial-gradient(circle at 30% 30%, #4169e1, #1a1a2e)',
                borderRadius: '50%',
                position: 'relative',
                animation: 'eyeMove 4s ease-in-out infinite'
            }}>
                {/* Pupil */}
                <div style={{
                    width: '12px',
                    height: '12px',
                    background: '#000',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}>
                    {/* Light reflection */}
                    <div style={{
                        width: '4px',
                        height: '4px',
                        background: '#fff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: '2px'
                    }} />
                </div>
            </div>
            
            {/* Eyelid for blinking effect */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                borderRadius: '50px',
                transform: 'translateY(-100%)',
                animation: 'eyelidBlink 3s infinite'
            }} />
        </div>
        
        <style>{`
            @keyframes eyeBlink {
                0%, 90%, 100% { 
                    height: 35px;
                }
                95% { 
                    height: 4px;
                }
            }
            
            @keyframes eyelidBlink {
                0%, 90%, 100% { 
                    transform: translateY(-100%);
                }
                95% { 
                    transform: translateY(0%);
                }
            }
            
            @keyframes eyeMove {
                0%, 100% { transform: translateX(0px); }
                25% { transform: translateX(-3px); }
                50% { transform: translateX(0px); }
                75% { transform: translateX(3px); }
            }
        `}</style>
    </div>
);

interface ButtonRowProps {
    onHoroscopeClick: () => void;
    onCameraClick: () => void;
    isLoading: boolean;
}

const ButtonRow: React.FC<ButtonRowProps> = ({ onHoroscopeClick, onCameraClick, isLoading }) => {
    return (
        <div style={{
            position: 'absolute',
            left: '10px',
            bottom: '130px',
            zIndex: 1002,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '15px', // Space between buttons
        }}>
            {/* Daily Horoscope Star Button using StarButton component */}
            <StarButton onClick={onHoroscopeClick} />

            {/* Camera Eye Button */}
            <EyeIcon onClick={onCameraClick} disabled={isLoading} />
        </div>
    );
};

export default ButtonRow;