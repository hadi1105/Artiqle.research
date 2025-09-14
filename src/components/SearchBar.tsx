import React, { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { Filter, X, ChevronLeft } from 'lucide-react';
import { SearchFilters } from '../types/paper';
import { ArtiqleBot } from './ArtiqleBot';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  loading: boolean;
  currentQuery?: string;
  currentFilters?: SearchFilters;
  geminiApiKey?: string;
  onApiKeyChange?: (apiKey: string) => void;
}

const RESEARCH_FIELDS = [
  // Computer Science & AI
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
  
  // Medicine & Health
  'Medicine',
  'Clinical Medicine',
  'Public Health',
  'Epidemiology',
  'Pharmacology',
  'Neuroscience',
  'Cardiology',
  'Oncology',
  'Immunology',
  'Genetics',
  'Molecular Biology',
  'Biochemistry',
  'Pathology',
  'Surgery',
  'Pediatrics',
  'Psychiatry',
  'Dermatology',
  'Radiology',
  'Emergency Medicine',
  'Internal Medicine',
  
  // Physical Sciences
  'Physics',
  'Chemistry',
  'Mathematics',
  'Statistics',
  'Astronomy',
  'Geology',
  'Environmental Science',
  'Materials Science',
  'Engineering',
  
  // Social Sciences
  'Psychology',
  'Sociology',
  'Economics',
  'Political Science',
  'Anthropology',
  'Education',
  'Linguistics',
  'Philosophy',
  
  // Life Sciences
  'Biology',
  'Ecology',
  'Botany',
  'Zoology',
  'Microbiology',
  'Biotechnology',
  'Agriculture',
  'Veterinary Science',
  
  // Other Fields
  'Business',
  'Management',
  'Finance',
  'Marketing',
  'Law',
  'History',
  'Literature',
  'Art',
  'Architecture',
  'Design'
] as const;

const RESEARCH_SOURCES = [
  // Core Academic Databases
  { id: 'semantic-scholar', name: 'Semantic Scholar', description: 'AI-powered academic search' },
  { id: 'arxiv', name: 'arXiv', description: 'Preprints in physics, math, CS' },
  { id: 'crossref', name: 'CrossRef', description: 'DOI database' },
  { id: 'pubmed', name: 'PubMed', description: 'Biomedical literature' },
  { id: 'openalex', name: 'OpenAlex', description: 'Open academic database' },
  { id: 'core', name: 'CORE', description: 'Open access papers' },
  
  // Medical & Health Journals
  { id: 'medline', name: 'MEDLINE', description: 'Medical literature database' },
  { id: 'cochrane', name: 'Cochrane Library', description: 'Systematic reviews' },
  { id: 'embase', name: 'Embase', description: 'Biomedical & pharmaceutical' },
  { id: 'psycinfo', name: 'PsycINFO', description: 'Psychology & behavioral sciences' },
  { id: 'cinahl', name: 'CINAHL', description: 'Nursing & allied health' },
  
  // Science & Engineering
  { id: 'ieee', name: 'IEEE Xplore', description: 'Engineering & technology' },
  { id: 'acm', name: 'ACM Digital Library', description: 'Computer science' },
  { id: 'springer', name: 'SpringerLink', description: 'Science & technology journals' },
  { id: 'wiley', name: 'Wiley Online Library', description: 'Multidisciplinary journals' },
  { id: 'elsevier', name: 'ScienceDirect', description: 'Scientific & medical journals' },
  
  // Social Sciences & Humanities
  { id: 'jstor', name: 'JSTOR', description: 'Arts, humanities & social sciences' },
  { id: 'sage', name: 'SAGE Journals', description: 'Social sciences & humanities' },
  { id: 'taylor', name: 'Taylor & Francis', description: 'Multidisciplinary research' },
  { id: 'oxford', name: 'Oxford Academic', description: 'Scholarly journals' },
  { id: 'cambridge', name: 'Cambridge Core', description: 'Academic journals' },
  
  // Open Access & Specialized
  { id: 'doaj', name: 'DOAJ', description: 'Directory of Open Access Journals' },
  { id: 'biorxiv', name: 'bioRxiv', description: 'Biology preprints' },
  { id: 'medrxiv', name: 'medRxiv', description: 'Medical preprints' },
  { id: 'chemrxiv', name: 'chemRxiv', description: 'Chemistry preprints' },
  { id: 'ssrn', name: 'SSRN', description: 'Social sciences research' },
  
  // Government & Policy
  { id: 'govinfo', name: 'GOV.INFO', description: 'Government publications' },
  { id: 'eric', name: 'ERIC', description: 'Education research' },
  { id: 'agris', name: 'AGRIS', description: 'Agricultural research' },
  { id: 'repec', name: 'RePEc', description: 'Economics research' },
  { id: 'dblp', name: 'DBLP', description: 'Computer science bibliography' }
] as const;

const SearchBar: React.FC<SearchBarProps> = memo(({ onSearch, loading, currentQuery = '', currentFilters = {}, geminiApiKey, onApiKeyChange }) => {
  const [query, setQuery] = useState(currentQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(currentFilters);
  const searchTimeoutRef = useRef<number | null>(null);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      console.log('Searching for:', query, 'with filters:', filters);
      onSearch(query, filters);
    }
  }, [query, filters, onSearch]);

  // Debounced search for better performance (currently unused but available for future use)
  // const debouncedSearch = useCallback(() => {
  //   if (searchTimeoutRef.current) {
  //     clearTimeout(searchTimeoutRef.current);
  //   }
  //   searchTimeoutRef.current = setTimeout(() => {
  //     handleSearch();
  //   }, 300);
  // }, [handleSearch]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // Generic filter change handler (kept for potential future use)
  // const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
  //   setFilters(prev => {
  //     // Only update if the value actually changed
  //     if (prev[key] === value) return prev;
  //     return {
  //       ...prev,
  //       [key]: value
  //     };
  //   });
  // }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Optimized handlers for specific filter types
  const handleSourceChange = useCallback((sourceId: string, checked: boolean) => {
    setFilters(prev => {
      const currentSources = prev.sources || [];
      const newSources = checked
        ? [...currentSources, sourceId]
        : currentSources.filter(s => s !== sourceId);
      
      // Only update if sources actually changed
      if (JSON.stringify(currentSources.sort()) === JSON.stringify(newSources.sort())) {
        return prev;
      }
      
      return { ...prev, sources: newSources };
    });
  }, []);

  const handleFieldChange = useCallback((field: string, checked: boolean) => {
    setFilters(prev => {
      const currentFields = prev.fields || [];
      const newFields = checked
        ? [...currentFields, field]
        : currentFields.filter(f => f !== field);
      
      // Only update if fields actually changed
      if (JSON.stringify(currentFields.sort()) === JSON.stringify(newFields.sort())) {
        return prev;
      }
      
      return { ...prev, fields: newFields };
    });
  }, []);

  const handleYearFromChange = useCallback((value: string) => {
    const yearFrom = value ? parseInt(value) : undefined;
    setFilters(prev => prev.yearFrom === yearFrom ? prev : { ...prev, yearFrom });
  }, []);

  const handleYearToChange = useCallback((value: string) => {
    const yearTo = value ? parseInt(value) : undefined;
    setFilters(prev => prev.yearTo === yearTo ? prev : { ...prev, yearTo });
  }, []);

  const handleMinCitationsChange = useCallback((value: string) => {
    const minCitations = value ? parseInt(value) : undefined;
    setFilters(prev => prev.minCitations === minCitations ? prev : { ...prev, minCitations });
  }, []);

  const hasActiveFilters = useMemo(() => 
    Object.values(filters).some(value => 
      value !== undefined && value !== null && 
      (Array.isArray(value) ? value.length > 0 : true)
    ), [filters]);

  // Update query and filters when props change (for navigation)
  useEffect(() => {
    setQuery(currentQuery);
    setFilters(currentFilters);
  }, [currentQuery, currentFilters]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex gap-6 items-start">
        {/* Filters Panel */}
        <div className={`${showFilters ? 'w-[800px]' : 'w-16'} flex-shrink-0`}>
          <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-3xl shadow-xl h-fit max-h-96 overflow-y-auto">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full h-16 flex items-center justify-center ${
                hasActiveFilters 
                  ? 'text-blue-600 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-200' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 border-transparent'
              } rounded-3xl border-2`}
            >
              {showFilters ? (
                <ChevronLeft className="h-6 w-6" />
              ) : (
                <Filter className="h-6 w-6" />
              )}
            </button>

                  {/* Filters Content */}
                  {showFilters && (
                    <div className="p-6 border-t border-gray-100/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="flex items-center px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        {/* Data Sources */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data Sources
                          </label>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                      {RESEARCH_SOURCES.map(source => (
                        <label key={source.id} className="flex items-start">
                          <input
                            type="checkbox"
                            checked={(filters.sources || []).includes(source.id)}
                            onChange={(e) => handleSourceChange(source.id, e.target.checked)}
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
                          <div className="space-y-1">
                            <input
                              type="number"
                              placeholder="From year"
                              value={filters.yearFrom || ''}
                              onChange={(e) => handleYearFromChange(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                            <input
                              type="number"
                              placeholder="To year"
                              value={filters.yearTo || ''}
                              onChange={(e) => handleYearToChange(e.target.value)}
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
                              onChange={(e) => handleMinCitationsChange(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                  </div>

                        {/* Research Fields */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Research Fields
                          </label>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                      {RESEARCH_FIELDS.map(field => (
                        <label key={field} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={(filters.fields || []).includes(field)}
                            onChange={(e) => handleFieldChange(field, e.target.checked)}
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
          <div className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for research papers..."
              className="block w-full h-16 pl-8 pr-20 border-2 border-gray-200 rounded-3xl text-lg placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gradient-to-r from-white to-blue-50/10"
              disabled={loading}
            />
            
            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center shadow-lg"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <svg 
                  className="h-6 w-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M13 7l5 5m0 0l-5 5m5-5H6" 
                  />
                </svg>
              )}
            </button>

            {/* Clear Button */}
            {query && !loading && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-16 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Artiqle Bot */}
          <div className="mt-4 flex justify-center">
            <ArtiqleBot 
              onSuggestionClick={(suggestion) => {
                setQuery(suggestion);
                onSearch(suggestion, filters);
              }}
              geminiApiKey={geminiApiKey}
              onApiKeyChange={onApiKeyChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export { SearchBar };