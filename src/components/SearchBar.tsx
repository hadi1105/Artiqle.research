import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { SearchFilters } from '../types/paper';
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X } from "lucide-react";

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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query, filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filters, onSearch]);

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
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 transition-colors ${loading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for research papers..."
          className="block w-full pl-10 pr-12 py-4 border border-gray-300 rounded-xl text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
        />
        <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute inset-y-0 right-0 pr-3 flex items-center space-x-1 transition-colors ${
              hasActiveFilters ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
           <AnimatePresence mode="wait">
              {!showFilters ? (
                <motion.div
                  key="filter"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-1"
              >
                <span>Filter</span>
            <Filter className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="close"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5" />
               </motion.div>
            )}
           </AnimatePresence>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Search Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Data Sources */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Sources
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {RESEARCH_SOURCES.map(source => (
                  <label key={source.id} className="flex items-center">
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
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="From"
                  value={filters.yearFrom || ''}
                  onChange={(e) => handleFilterChange('yearFrom', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="To"
                  value={filters.yearTo || ''}
                  onChange={(e) => handleFilterChange('yearTo', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Research Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research Fields
              </label>
              <select
                multiple
                value={filters.fields || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange('fields', selected);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                size={4}
              >
                {RESEARCH_FIELDS.map(field => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};