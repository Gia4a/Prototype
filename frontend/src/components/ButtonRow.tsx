import React from 'react';

// Star Button Component with spinning text and all styling
const StarButton = ({ onClick }: { onClick: () => void }) => (
    <div
        onClick={onClick}
        style={{
            position: 'relative',
            width: 'clamp(4rem, 15vw, 6.5625rem)',
            height: 'clamp(4rem, 15vw, 6.5625rem)',
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
            @keyframes sparkle {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }
            
            @keyframes spin-text {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
            }
        `}</style>
    </div>
);

// Pyramid Eye Icon Component (Eye of Providence)
const EyeIcon = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
    <div
        onClick={disabled ? undefined : onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            width: 'clamp(4.5rem, 18vw, 7.5rem)',
            height: 'clamp(3rem, 12vw, 5rem)',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100)',
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
            width: 'clamp(2.5rem, 10vw, 3.75rem)',
            height: 'clamp(2.5rem, 10vw, 3.75rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {/* Triangle/Pyramid shape */}
            <div style={{
                position: 'relative',
                width: 0,
                height: 0,
                borderLeft: 'clamp(2.25rem, 9vw, 3.375rem) solid transparent',
                borderRight: 'clamp(2.25rem, 9vw, 3.375rem) solid transparent',
                borderBottom: 'clamp(3.75rem, 15vw, 5.625rem) solid #d3d3d3',
                zIndex: 1
            }} />

            {/* Eye positioned over triangle */}
            <div style={{
                position: 'absolute',
                top: 'clamp(1rem, 13vw, 2.5rem)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'clamp(3rem, 12vw, 4.5rem)',
                height: 'clamp(1.078125rem, 4.3125vw, 1.6171875rem)',
                background: '#fff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.8)',
                animation: 'pulse-rays 2s ease-in-out infinite',
                zIndex: 2
            }}>
                {/* Rays around the eye */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: '2px',
                            height: 'clamp(0.5rem, 2vw, 0.8rem)',
                            background: 'linear-gradient(to bottom, #ffd700, transparent)',
                            transformOrigin: 'bottom center',
                            transform: `rotate(${i * 30}deg) translateY(-${i % 2 === 0 ? '1.2rem' : '1rem'})`,
                            left: '50%',
                            bottom: '50%',
                            marginLeft: '-1px',
                        }}
                    />
                ))}

                {/* Iris */}
                <div style={{
                    width: 'clamp(1.5rem, 6vw, 2.25rem)',
                    height: 'clamp(0.8rem, 3.2vw, 1.2rem)',
                    background: 'radial-gradient(circle at 30% 30%, #4169e1, #1a1a2e)',
                    borderRadius: '50%',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* Pupil */}
                    <div style={{
                        width: 'clamp(0.375rem, 1.5vw, 0.5625rem)',
                        height: 'clamp(0.375rem, 1.5vw, 0.5625rem)',
                        background: '#000',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}>
                        {/* Light reflection */}
                        <div style={{
                            width: 'clamp(0.1875rem, 0.75vw, 0.28125rem)',
                            height: 'clamp(0.1875rem, 0.75vw, 0.28125rem)',
                            background: '#fff',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '0.075rem',
                            left: '0.075rem'
                        }} />
                    </div>
                </div>

                {/* Eyelid for blinking effect - only on the eye! */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    borderRadius: '50%',
                    transform: 'translateY(-100%)',
                    animation: 'eyelidBlink 3s infinite',
                    zIndex: 10
                }} />
            </div>
        </div>

        <style>{`
            @keyframes eyelidBlink {
                0%, 90%, 100% { 
                    transform: translateY(-100%);
                }
                95% { 
                    transform: translateY(0%);
                }
            }
            
            @keyframes pulse-rays {
                0%, 100% { 
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
                }
                50% { 
                    box-shadow: 0 0 30px rgba(255, 215, 0, 1), 0 0 40px rgba(255, 215, 0, 0.8);
                }
            }
        `}</style>
    </div>
);

// Microphone Button Component
const MicrophoneButton = ({ onClick }: { onClick: () => void }) => (
    <div
        onClick={onClick}
        style={{
            position: 'relative',
            width: 'clamp(4rem, 15vw, 6.5625rem)',
            height: 'clamp(4rem, 15vw, 6.5625rem)',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
        }}
    >
        {/* Microphone shape */}
        <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            borderRadius: '50%',
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
            {/* Microphone icon */}
            <div style={{
                width: 'clamp(1.2rem, 5vw, 2rem)',
                height: 'clamp(1.5rem, 6vw, 2.5rem)',
                background: '#fff',
                borderRadius: 'clamp(0.6rem, 2.4vw, 1rem)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {/* Microphone grille */}
                <div style={{
                    width: 'clamp(0.4rem, 1.6vw, 0.7rem)',
                    height: 'clamp(1.1rem, 4.4vw, 1.8rem)',
                    background: 'linear-gradient(to bottom, #333 0%, #333 25%, transparent 25%, transparent 35%, #333 35%, #333 50%, transparent 50%, transparent 60%, #333 60%, #333 75%, transparent 75%, transparent 85%, #333 85%, #333 100%)',
                    borderRadius: 'clamp(0.2rem, 0.8vw, 0.35rem)',
                }} />
                {/* Base */}
                <div style={{
                    position: 'absolute',
                    bottom: 'clamp(-0.2rem, -0.8vw, -0.35rem)',
                    width: 'clamp(0.8rem, 3.2vw, 1.4rem)',
                    height: 'clamp(0.4rem, 1.6vw, 0.7rem)',
                    background: '#fff',
                    borderRadius: '50%',
                }} />
            </div>
        </div>
    </div>
);

interface ButtonRowProps {
    onHoroscopeClick: () => void;
    onCameraClick: () => void;
    onSpeechClick: () => void;
    isLoading: boolean;
}

const ButtonRow: React.FC<ButtonRowProps> = ({ onHoroscopeClick, onCameraClick, onSpeechClick, isLoading }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0.9375rem',
        }}>
            {/* Daily Horoscope Star Button */}
            <StarButton onClick={onHoroscopeClick} />

            {/* Camera Eye Button */}
            <EyeIcon onClick={onCameraClick} disabled={isLoading} />

            {/* Speech Microphone Button */}
            <MicrophoneButton onClick={onSpeechClick} />
        </div>
    );
};

export default ButtonRow;