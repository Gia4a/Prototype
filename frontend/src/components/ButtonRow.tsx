import React from 'react';

// Star Button Component with spinning text and all styling
const StarButton = ({ onClick }: { onClick: () => void }) => (
    <div
        onClick={onClick}
        style={{
            position: 'relative',
            width: 'clamp(4rem, 15vw, 6.5625rem)', // 64px to 105px
            height: 'clamp(4rem, 15vw, 6.5625rem)', // 64px to 105px
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(-10deg)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
        }}
    >
        {/* Star shape */}
        <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            border: '3px solid',
            borderImage: 'linear-gradient(135deg, #4169e1, #7c3aed) 1',
            boxShadow: `
                0 0 15px rgba(65, 105, 225, 0.4),
                0 4px 10px rgba(0, 0, 0, 0.3),
                inset 0 1px 2px rgba(255, 255, 255, 0.1)
            `,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {/* Sparkle effect */}
            <div style={{
                content: '',
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                background: 'linear-gradient(45deg, transparent, rgba(135, 206, 235, 0.2), transparent)',
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                animation: 'sparkle 3s ease-in-out infinite',
                zIndex: -1,
            }} />
        </div>

        {/* Spinning text */}
        <div style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            animation: 'spin-text 8s linear infinite',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        }}>
            {'ASTRO•ZODICUPS•'.split('').map((char, index) => (
                <span
                    key={index}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#87ceeb',
                        textShadow: '0 0 3px rgba(135, 206, 235, 0.8)',
                        transformOrigin: '0 55px',
                        whiteSpace: 'nowrap',
                        transform: `rotate(${index * (360 / 15)}deg) translateX(-50%)`,
                    }}
                >
                    {char}
                </span>
            ))}
        </div>

        {/* Center icon */}
        <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontSize: '17px',
            fontWeight: 'bold',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 2,
            textShadow: '0 2px 8px rgba(65, 105, 225, 0.4), 0 0 6px #7c3aed',
        }}>
            ✦
        </div>

        <style>{`
            @keyframes spin-text {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            
            @keyframes sparkle {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }
        `}</style>
    </div>
);

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
            width: 'clamp(4.5rem, 18vw, 7.5rem)', // 72px to 120px
            height: 'clamp(3rem, 12vw, 5rem)', // 48px to 80px
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
            width: 'clamp(2.5rem, 10vw, 3.75rem)', // 40px to 60px
            height: 'clamp(1.5rem, 6vw, 2.1875rem)', // 24px to 35px
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
                width: 'clamp(1rem, 4vw, 1.5rem)', // 16px to 24px
                height: 'clamp(1rem, 4vw, 1.5rem)', // 16px to 24px
                background: 'radial-gradient(circle at 30% 30%, #4169e1, #1a1a2e)',
                borderRadius: '50%',
                position: 'relative',
                animation: 'eyeMove 4s ease-in-out infinite'
            }}>
                {/* Pupil */}
                <div style={{
                    width: 'clamp(0.5rem, 2vw, 0.75rem)', // 8px to 12px
                    height: 'clamp(0.5rem, 2vw, 0.75rem)', // 8px to 12px
                    background: '#000',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}>
                    {/* Light reflection */}
                    <div style={{
                        width: 'clamp(0.2rem, 0.8vw, 0.25rem)', // 3.2px to 4px
                        height: 'clamp(0.2rem, 0.8vw, 0.25rem)', // 3.2px to 4px
                        background: '#fff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '0.125rem', // 2px
                        left: '0.125rem' // 2px
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
                    height: 100%;
                }
                95% { 
                    height: 11.4%; /* approximately 4px relative to 35px */
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
                0%, 100% { transform: translateX(0rem); }
                25% { transform: translateX(-0.1875rem); } /* -3px */
                50% { transform: translateX(0rem); }
                75% { transform: translateX(0.1875rem); } /* 3px */
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
            left: '0.625rem', // 10px
            bottom: '8.125rem', // 130px
            zIndex: 1002,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0.9375rem', // 15px
        }}>
            {/* Daily Horoscope Star Button */}
            <StarButton onClick={onHoroscopeClick} />

            {/* Camera Eye Button */}
            <EyeIcon onClick={onCameraClick} disabled={isLoading} />
        </div>
    );
};

export default ButtonRow;