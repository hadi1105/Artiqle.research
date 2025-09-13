import React, { useState } from 'react';
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchFilters } from '../types/paper';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  loading: boolean;
}

const RESEARCH_FIELDS = [
  'Machine Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Artificial Intelligence',
  'Data Science',
  'Robotics',
  'Human-Computer Interaction',
  'Software Engineering',
  'Bioinformatics',
  'Computational Biology',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Statistics'
];

const RESEARCH_SOURCES = [
  { id: 'semantic-scholar', name: 'Semantic Scholar', description: 'AI-powered academic search' },
  { id: 'arxiv', name: 'arXiv', description: 'Preprints in physics, math, CS' },
  { id: 'crossref', name: 'CrossRef', description: 'DOI database' },
  { id: 'pubmed', name: 'PubMed', description: 'Biomedical literature' },
  { id: 'openalex', name: 'OpenAlex', description: 'Open academic database' },
  { id: 'core', name: 'CORE', description: 'Open access papers' }
];

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = () => {
    if (query.trim()) {
      console.log('Searching for:', query, 'with filters:', filters);
      onSearch(query, filters);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex gap-4">
        {/* Filters Panel */}
        <div className={`transition-all duration-300 ${showFilters ? 'w-80' : 'w-12'}`}>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm h-fit">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full p-3 flex items-center justify-center transition-colors ${
                hasActiveFilters ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              } rounded-xl`}
            >
              {showFilters ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <Filter className="h-5 w-5" />
              )}
            </button>

            {/* Filters Content */}
            {showFilters && (
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Data Sources */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Sources
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {RESEARCH_SOURCES.map(source => (
                        <label key={source.id} className="flex items-start">
                          <input
                            type="checkbox"
                            checked={(filters.sources || []).includes(source.id)}
                            onChange={(e) => {
                              const currentSources = filters.sources || [];
                              const newSources = e.target.checked
                                ? [...currentSources, source.id]
                                : currentSources.filter(s => s !== source.id);
                              handleFilterChange('sources', newSources);
                            }}
                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-700">{source.name}</div>
                            <div className="text-xs text-gray-500">{source.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Year Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publication Year
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="From year"
                        value={filters.yearFrom || ''}
                        onChange={(e) => handleFilterChange('yearFrom', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="number"
                        placeholder="To year"
                        value={filters.yearTo || ''}
                        onChange={(e) => handleFilterChange('yearTo', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  {/* Minimum Citations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Citations
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 100"
                      value={filters.minCitations || ''}
                      onChange={(e) => handleFilterChange('minCitations', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Research Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Research Fields
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {RESEARCH_FIELDS.map(field => (
                        <label key={field} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={(filters.fields || []).includes(field)}
                            onChange={(e) => {
                              const currentFields = filters.fields || [];
                              const newFields = e.target.checked
                                ? [...currentFields, field]
                                : currentFields.filter(f => f !== field);
                              handleFilterChange('fields', newFields);
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{field}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for research papers... (Press Enter to search)"
              className="block w-full pl-4 pr-32 py-4 border border-gray-300 rounded-xl text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
              disabled={loading}
            />
            
            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute inset-y-0 right-24 flex items-center text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="absolute inset-y-0 right-2 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {filters.yearFrom && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  From: {filters.yearFrom}
                </span>
              )}
              {filters.yearTo && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  To: {filters.yearTo}
                </span>
              )}
              {filters.minCitations && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Min citations: {filters.minCitations}
                </span>
              )}
              {filters.sources && filters.sources.length > 0 && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {filters.sources.length} source{filters.sources.length > 1 ? 's' : ''}
                </span>
              )}
              {filters.fields && filters.fields.length > 0 && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {filters.fields.length} field{filters.fields.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};