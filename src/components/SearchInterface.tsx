import React, { useState, useCallback } from 'react';
import { Search, Sparkles, Settings, Microscope } from 'lucide-react';
import { SearchFilters } from '../types/paper';
import { FilterPanel } from './FilterPanel';

interface SearchInterfaceProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  loading: boolean;
  currentQuery: string;
  currentFilters: SearchFilters;
  hasSearched: boolean;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onSearch,
  loading,
  currentQuery,
  currentFilters,
  hasSearched
}) => {
  const [query, setQuery] = useState(currentQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(currentFilters);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      onSearch(query, filters);
    }
  }, [query, filters, onSearch]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <div className={`flex flex-col ${hasSearched ? 'border-b border-gray-100' : 'flex-1 justify-center'}`}>
      {/* Welcome Section - Only show when no searches */}
      {!hasSearched && (
        <div className="text-center mb-12 px-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mr-4">
              <Microscope className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900">
              Artiqle<span className="text-blue-600">AI</span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">Your AI-powered research assistant</p>
          <p className="text-gray-500">Search across millions of academic papers from top journals and databases</p>
        </div>
      )}

      {/* Search Bar */}
      <div className={`px-6 ${hasSearched ? 'py-4' : 'pb-8'}`}>
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Search className="h-5 w-5 text-gray-400 ml-4" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for research papers..."
                className="flex-1 px-4 py-4 text-lg bg-transparent border-none outline-none placeholder-gray-400"
                disabled={loading}
              />
              
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 mr-2 rounded-lg transition-colors ${
                  hasActiveFilters || showFilters
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-5 w-5" />
              </button>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="mr-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  'Search'
                )}
              </button>
            </div>

            {/* AI Suggestions */}
            {!hasSearched && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  'Latest AI research trends',
                  'Climate change solutions', 
                  'Quantum computing advances',
                  'Cancer immunotherapy',
                  'Renewable energy efficiency'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion);
                      onSearch(suggestion, filters);
                    }}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full border border-gray-200 hover:border-blue-200 transition-colors"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};