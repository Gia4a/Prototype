import React, { useState } from 'react';
import SpeechModal from './SpeechModal';
import { getCocktailFromSpeech } from '../api';

// Interfaces - keeping for potential speech modal compatibility
interface MixologistResponse {
    originalQuery: string;
    suggestion: string;
    title?: string;
    content?: string;
    filePath?: string;
    results?: any[];
    searchType?: string;
    snippet?: string;
    why?: string;
    cocktailRecommendation?: any;
}

interface SearchBarProps {
    onNewSuggestion: (suggestion: MixologistResponse | string | null, query?: string) => void;
    onLoadingChange: (loading: boolean) => void;
    onError: (error: string) => void;
    isLoading: boolean;
    onUpgradeRequest?: (originalQuery: string, upgradeType: string) => void;
    showCamera: boolean; // Keep for compatibility but not used
    onCameraToggle: () => void; // Keep for compatibility but not used
}

const SearchBar: React.FC<SearchBarProps> = ({ 
    onNewSuggestion, 
    onError 
}) => {
    const [query, setQuery] = useState('');
    const [showSpeechModal, setShowSpeechModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Handle speech input
    const handleSpeechResult = async (transcript: string) => {
        setIsProcessing(true);
        try {
            // Call Firebase Function for speech processing
            const result = await getCocktailFromSpeech(transcript) as any;

            // Format response for the app
            const speechResponse: MixologistResponse = {
                originalQuery: transcript,
                suggestion: result.response || 'No response from bartender',
                title: 'Bartender Recommendation',
                searchType: 'speech',
                cocktailRecommendation: result.cocktailRecommendation
            };

            onNewSuggestion(speechResponse, transcript);
        } catch (error) {
            console.error('Speech processing error:', error);
            onError(`Failed to process speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Open speech modal
    const handleSpeechInput = () => {
        setShowSpeechModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            // For now, show message about speech modal
            const message: MixologistResponse = {
                originalQuery: query,
                suggestion: 'Please use the speech button for cocktail recommendations!',
                title: 'Use Speech Feature',
                searchType: 'info'
            };
            onNewSuggestion(message, query);
        }
    };

    return (
        <>
            <div className="universal-card-container" style={{ 
                position: 'relative', 
                margin: '0 auto', 
                marginBottom: '20px' 
            }}>
                <form onSubmit={handleSubmit} style={{ 
                    display: 'flex', 
                    gap: '10px',
                    width: '100%',
                    maxWidth: '100%'
                }}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Use speech button for best results..."
                        style={{
                            padding: 'clamp(8px, 2vw, 10px)',
                            flex: 1,
                            boxSizing: 'border-box',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: 'clamp(14px, 4vw, 16px)',
                            backgroundColor: '#f9f9f9'
                        }}
                        disabled={isProcessing}
                    />
                    <button 
                        type="button" 
                        onClick={handleSpeechInput}
                        disabled={isProcessing}
                        style={{
                            padding: 'clamp(8px, 2vw, 10px)',
                            backgroundColor: isProcessing ? '#cccccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: 'clamp(12px, 3vw, 14px)',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {isProcessing ? '🔄 Processing...' : '🎤 Ask Bartender'}
                    </button>
                </form>
            </div>

            <SpeechModal
                isOpen={showSpeechModal}
                onClose={() => setShowSpeechModal(false)}
                onSpeechResult={handleSpeechResult}
                onError={onError}
            />
        </>
    );
};

export default SearchBar;