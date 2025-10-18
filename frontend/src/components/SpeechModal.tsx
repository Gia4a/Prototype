import React, { useState, useEffect, useRef, useCallback } from 'react';

// TypeScript declarations for Web Speech API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface SpeechModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSpeechResult: (transcript: string) => void;
    onError: (error: string) => void;
}

const SpeechModal: React.FC<SpeechModalProps> = ({
    isOpen,
    onClose,
    onSpeechResult,
    onError
}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [confidence, setConfidence] = useState(0);
    const recognitionRef = useRef<any>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isStoppingRef = useRef(false);

    // Check for browser support
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsListening(true);
                isStoppingRef.current = false;
                console.log('Speech recognition started');
            };

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript;
                        setConfidence(result[0].confidence);
                    } else {
                        interimTranscript += result[0].transcript;
                    }
                }

                const fullTranscript = finalTranscript || interimTranscript;
                setTranscript(fullTranscript);

                // Auto-stop after getting a final result
                if (finalTranscript) {
                    // Set a timeout to stop listening after final result
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                    }
                    timeoutRef.current = setTimeout(() => {
                        if (recognitionRef.current && !isStoppingRef.current) {
                            isStoppingRef.current = true;
                            recognitionRef.current.stop();
                        }
                    }, 1500);
                }
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                
                // Don't treat 'no-speech' as an error - just restart
                if (event.error === 'no-speech') {
                    console.log('No speech detected, continuing to listen...');
                    return;
                }
                
                let errorMessage = 'Speech recognition failed';
                switch (event.error) {
                    case 'aborted':
                        return; // Silent - user stopped manually
                    case 'audio-capture':
                        errorMessage = 'Microphone not available. Please check permissions.';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Microphone permission denied. Please allow microphone access.';
                        break;
                    case 'network':
                        errorMessage = 'Network error. Please check your connection.';
                        break;
                    default:
                        errorMessage = `Speech recognition error: ${event.error}`;
                }
                onError(errorMessage);
            };

            recognition.onend = () => {
                console.log('Speech recognition ended');
                setIsListening(false);
                
                // Auto-restart if we're still open and not manually stopping
                if (isOpen && !isStoppingRef.current) {
                    console.log('Restarting speech recognition...');
                    setTimeout(() => {
                        try {
                            if (recognitionRef.current && !isStoppingRef.current) {
                                recognitionRef.current.start();
                            }
                        } catch (error) {
                            console.error('Failed to restart recognition:', error);
                        }
                    }, 100);
                }
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [onError, isOpen]);

    const startListening = useCallback(() => {
        if (!isSupported || !recognitionRef.current) {
            onError('Speech recognition is not supported in this browser');
            return;
        }

        setTranscript('');
        setConfidence(0);
        isStoppingRef.current = false;
        
        try {
            recognitionRef.current.start();
        } catch (error: any) {
            // If already started, ignore the error
            if (error.message && error.message.includes('already started')) {
                console.log('Recognition already started');
                return;
            }
            console.error('Failed to start speech recognition:', error);
            onError('Failed to start speech recognition');
        }
    }, [isSupported, onError]);

    const stopListening = useCallback(() => {
        isStoppingRef.current = true;
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, [isListening]);

    const handleSubmit = () => {
        if (transcript.trim()) {
            stopListening();
            onSpeechResult(transcript.trim());
            setTranscript('');
            onClose();
        }
    };

    const handleClose = () => {
        stopListening();
        setTranscript('');
        onClose();
    };

    // Auto-close modal when not open
    useEffect(() => {
        if (!isOpen) {
            isStoppingRef.current = true;
            stopListening();
            setTranscript('');
        } else {
            // Auto-start listening when modal opens
            const timer = setTimeout(() => {
                startListening();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, startListening, stopListening]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '30px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                position: 'relative'
            }}>
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#666'
                    }}
                >
                    ×
                </button>

                <h2 style={{ 
                    marginTop: 0, 
                    marginBottom: '20px',
                    textAlign: 'center',
                    color: '#333'
                }}>
                    🎤 Ask Your Bartender
                </h2>

                {!isSupported ? (
                    <div style={{ textAlign: 'center', color: '#e74c3c' }}>
                        <p>Speech recognition is not supported in this browser.</p>
                        <p>Please try Chrome, Edge, or Safari.</p>
                    </div>
                ) : (
                    <>
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                backgroundColor: isListening ? '#e74c3c' : '#3498db',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                animation: isListening ? 'pulse 1.5s infinite' : 'none'
                            }}
                            onClick={isListening ? stopListening : startListening}
                            >
                                <span style={{ 
                                    fontSize: '40px', 
                                    color: 'white'
                                }}>
                                    {isListening ? '🔴' : '🎤'}
                                </span>
                            </div>
                            <p style={{ 
                                marginTop: '10px', 
                                color: '#666',
                                fontSize: '14px'
                            }}>
                                {isListening ? 'Listening... (click to stop)' : 'Click to start speaking'}
                            </p>
                        </div>

                        <div style={{
                            minHeight: '80px',
                            padding: '15px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: '2px solid #e9ecef'
                        }}>
                            {transcript ? (
                                <>
                                    <p style={{ 
                                        margin: 0, 
                                        fontSize: '16px',
                                        lineHeight: '1.4'
                                    }}>
                                        "{transcript}"
                                    </p>
                                    {confidence > 0 && (
                                        <p style={{ 
                                            margin: '10px 0 0 0', 
                                            fontSize: '12px', 
                                            color: '#666'
                                        }}>
                                            Confidence: {Math.round(confidence * 100)}%
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p style={{ 
                                    margin: 0, 
                                    color: '#999',
                                    fontStyle: 'italic'
                                }}>
                                    {isListening ? 'Listening for your question...' : 'Try saying: "What can I make with vodka?" or "I want something fruity"'}
                                </p>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={handleClose}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!transcript.trim()}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: transcript.trim() ? '#28a745' : '#cccccc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: transcript.trim() ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Get Recommendation
                            </button>
                        </div>
                    </>
                )}
            </div>

            <style>
                {`
                    @keyframes pulse {
                        0% {
                            transform: scale(1);
                            box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
                        }
                        70% {
                            transform: scale(1.05);
                            box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
                        }
                        100% {
                            transform: scale(1);
                            box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default SpeechModal;