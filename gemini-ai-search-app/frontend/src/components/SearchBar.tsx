// filepath: gemini-ai-search-app/frontend/src/components/SearchBar.tsx
import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search with Gemini AI..."
                style={{ padding: '10px', marginRight: '10px', width: '300px' }}
                disabled={isLoading}
            />
            <button type="submit" style={{ padding: '10px' }} disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
            </button>
        </form>
    );
};

export default SearchBar;