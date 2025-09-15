import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchInterface } from './components/SearchInterface';
import { ResultsView } from './components/ResultsView';
import { BookmarkList } from './components/BookmarkList';
import { useSearchHistory } from './hooks/useSearchHistory';
import { useBookmarks } from './hooks/useBookmarks';

function App() {
  const { 
    searchResult, 
    loading, 
    error, 
    search, 
    currentQuery,
    currentFilters,
    clearSearch
  } = useSearchHistory();
  
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback((query: string, filters: any) => {
    setHasSearched(true);
    search(query, filters);
  }, [search]);

  const handleShowBookmarks = useCallback(() => {
    setShowBookmarks(true);
  }, []);

  const handleGoToLanding = useCallback(() => {
    setHasSearched(false);
    clearSearch();
  }, [clearSearch]);

  const handleCloseBookmarks = useCallback(() => {
    setShowBookmarks(false);
  }, []);

  // Update hasSearched based on current query
  useEffect(() => {
    setHasSearched(!!(currentQuery && currentQuery.trim()));
  }, [currentQuery]);

  return (
    <div className="min-h-screen bg-white">
      <Header 
        bookmarkCount={bookmarks.length}
        onShowBookmarks={handleShowBookmarks}
        onGoToLanding={handleGoToLanding}
        hasSearched={hasSearched}
      />

      <main className="flex flex-col h-[calc(100vh-64px)]">
        <SearchInterface
          onSearch={handleSearch}
          loading={loading}
          currentQuery={currentQuery || ''}
          currentFilters={currentFilters || {}}
          hasSearched={hasSearched}
        />

        <ResultsView
          searchResult={searchResult}
          loading={loading}
          error={error}
          currentQuery={currentQuery}
          hasSearched={hasSearched}
          bookmarks={bookmarks}
          isBookmarked={isBookmarked}
          onToggleBookmark={toggleBookmark}
        />
      </main>

      {/* Bookmarks Modal */}
      {showBookmarks && (
        <BookmarkList
          bookmarks={bookmarks}
          onToggleBookmark={toggleBookmark}
          onClose={handleCloseBookmarks}
        />
      )}
    </div>
  );
}

export default App;