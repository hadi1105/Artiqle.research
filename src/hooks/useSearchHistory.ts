import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchFilters, SearchResult } from '../types/paper';

export const useSearchHistory = () => {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});
  const isNavigatingRef = useRef(false);

  // Update URL when search state changes
  const updateURL = useCallback((query: string, filters: SearchFilters) => {
    const url = new URL(window.location.href);
    
    if (query) {
      url.searchParams.set('q', query);
      if (Object.keys(filters).length > 0) {
        url.searchParams.set('filters', encodeURIComponent(JSON.stringify(filters)));
      } else {
        url.searchParams.delete('filters');
      }
    } else {
      url.searchParams.delete('q');
      url.searchParams.delete('filters');
    }

    // Update URL without triggering navigation
    window.history.replaceState(
      { query, filters, timestamp: Date.now() },
      '',
      url.toString()
    );
  }, []);

  // Push new state to browser history
  const pushToHistory = useCallback((query: string, filters: SearchFilters, result: SearchResult) => {
    const state = { query, filters, result, timestamp: Date.now() };
    const url = new URL(window.location.href);
    
    if (query) {
      url.searchParams.set('q', query);
      if (Object.keys(filters).length > 0) {
        url.searchParams.set('filters', encodeURIComponent(JSON.stringify(filters)));
      } else {
        url.searchParams.delete('filters');
      }
    } else {
      url.searchParams.delete('q');
      url.searchParams.delete('filters');
    }

    window.history.pushState(state, '', url.toString());
  }, []);

  const search = useCallback(async (query: string, filters: SearchFilters = {}) => {
    if (!query.trim() && Object.keys(filters).length === 0) {
      setSearchResult(null);
      setCurrentQuery('');
      setCurrentFilters({});
      updateURL('', {});
      return;
    }

    // Don't search if we're navigating via browser history
    if (isNavigatingRef.current) {
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentQuery(query);
    setCurrentFilters(filters);

    try {
      // Import SearchService dynamically to avoid circular dependencies
      const { SearchService } = await import('../services/searchService');
      const result = await SearchService.searchPapers(query, filters);
      
      setSearchResult(result);
      
      // Push to browser history
      pushToHistory(query, filters, result);
    } catch (err) {
      setError('Failed to search papers. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [pushToHistory, updateURL]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      isNavigatingRef.current = true;
      
      if (event.state) {
        const { query, filters, result } = event.state;
        setCurrentQuery(query || '');
        setCurrentFilters(filters || {});
        setSearchResult(result || null);
      } else {
        // No state (e.g., direct URL access)
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q') || '';
        const filtersParam = urlParams.get('filters');
        let filters: SearchFilters = {};
        
        if (filtersParam) {
          try {
            filters = JSON.parse(decodeURIComponent(filtersParam));
          } catch (e) {
            console.warn('Failed to parse filters from URL:', e);
          }
        }

        setCurrentQuery(query);
        setCurrentFilters(filters);
        
        if (query) {
          // Need to search for this query
          search(query, filters);
        } else {
          setSearchResult(null);
        }
      }
      
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [search]);

  // Initialize from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || '';
    const filtersParam = urlParams.get('filters');
    let filters: SearchFilters = {};
    
    if (filtersParam) {
      try {
        filters = JSON.parse(decodeURIComponent(filtersParam));
      } catch (e) {
        console.warn('Failed to parse filters from URL:', e);
      }
    }

    if (query) {
      setCurrentQuery(query);
      setCurrentFilters(filters);
      // Trigger search for initial query
      search(query, filters);
    }
  }, [search]);

  const clearSearch = useCallback(() => {
    setSearchResult(null);
    setCurrentQuery('');
    setCurrentFilters({});
    updateURL('', {});
    
    // Clear browser history for this session
    window.history.replaceState(null, '', window.location.pathname);
  }, [updateURL]);

  return {
    searchResult,
    loading,
    error,
    search,
    currentQuery,
    currentFilters,
    clearSearch
  };
};