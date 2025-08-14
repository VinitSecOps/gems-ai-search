import React, { useState, useEffect, useRef } from 'react';
import { Search, Zap, Loader } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SearchBar = ({ 
  query, 
  setQuery, 
  loading,
  suggestions,
  loadingSuggestions,
  handleSearch, 
  handleKeyPress,
  handleExampleClick
}) => {
  const { theme } = useTheme();
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Focus animation
  useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus();
    }
  }, [isFocused]);

  return (
    <div className="relative mb-4">
      {/* Orange accent line that expands on focus */}
      <div 
        className={`absolute bottom-0 left-0 h-0.5 bg-gems-orange transition-all duration-300 ease-in-out rounded-full
          ${isFocused ? 'w-full' : 'w-0'}`}
      />

      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className={`h-5 w-5 ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-400'} transition-colors`} />
      </div>

      {/* Input field with neumorphic style */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Ask about your GEMS data... (e.g., 'Show me active companies')"
        className={`w-full pl-12 pr-32 py-4 text-lg rounded-lg
          ${isFocused ? 'ring-2 ring-gems-orange' : 'ring-1 ring-transparent'} 
          ${theme === 'dark' 
            ? 'bg-dark-surface border-dark-border text-dark-text placeholder-dark-text-secondary'
            : 'bg-light-surface border-light-border text-light-text placeholder-light-text-secondary'
          } 
          border transition-all focus:outline-none
          ${!loading && query && !isFocused ? 'animate-pulse-orange' : ''}
          shadow-neumorph-inset-${theme}`}
        disabled={loading}
        aria-label="Search query input"
      />

      {/* Search button with orange gradient */}
      <button
        onClick={handleSearch}
        disabled={loading || !query.trim()}
        className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 
          bg-orange-gradient text-white rounded-md hover:scale-105 
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          flex items-center transition-all duration-200`}
        aria-label="Search"
      >
        {loading ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Search
          </>
        )}
      </button>

      {/* Suggestions box removed as requested */}
    </div>
  );
};

export default SearchBar;
