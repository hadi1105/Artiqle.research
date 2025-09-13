import { useState, useCallback } from 'react';
import { SearchFilters, SearchResult } from '../types/paper';
import { SearchService } from '../services/searchService';

export const useSearch = () => {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, filters: SearchFilters = {}) => {
    if (!query.trim() && Object.keys(filters).length === 0) {
      setSearchResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await SearchService.searchPapers(query, filters);
      setSearchResult(result);
    } catch (err) {
      setError('Failed to search papers. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchResult,
    loading,
    error,
    search
  };
};