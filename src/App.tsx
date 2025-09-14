import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { PaperCard } from './components/PaperCard';
import { BookmarkList } from './components/BookmarkList';
import { SearchSuggestions } from './components/SearchSuggestions';
import { useSearchHistory } from './hooks/useSearchHistory';
import { useBookmarks } from './hooks/useBookmarks';
import { Microscope, BookOpen } from 'lucide-react';

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
  
  // Gemini API key state (can be set by user)
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback((query: string, filters: any) => {
    setHasSearched(true);
    search(query, filters);
  }, [search]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    search(suggestion, {});
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
      />

      {/* Animated Landing Page - Only shows before first search */}
      {!hasSearched && !loading && (
        <div className="relative min-h-[calc(100vh-80px)] flex items-start justify-center overflow-hidden pt-20">
          {/* Static Gradient Background - Full Window */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/30 to-purple-50/30">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/5 via-indigo-100/5 to-purple-100/5"></div>
          </div>

          {/* Landing Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
            {/* Main Heading with Inline Search Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4 rounded-2xl mr-4 shadow-xl">
                <Microscope className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Artiqle
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                  AI
                </span>
              </h1>
            </div>

            {/* Highlight Subtitle */}
            <p className="text-3xl md:text-4xl text-gray-600 mb-6 font-light leading-relaxed">
              Your Personal Research Assistant
            </p>

            {/* Description */}
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover academic papers across multiple databases with intelligent search, 
              smart filtering, and comprehensive results in one place.
            </p>

            {/* Search Bar - Positioned in center */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar onSearch={handleSearch} loading={loading} currentQuery={currentQuery || ''} currentFilters={currentFilters || {}} geminiApiKey={geminiApiKey} onApiKeyChange={setGeminiApiKey} />
            </div>

          </div>
        </div>
      )}

      {/* Main Content - Only shows after first search */}
      {hasSearched && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="mb-12">
            <SearchBar onSearch={handleSearch} loading={loading} currentQuery={currentQuery || ''} currentFilters={currentFilters || {}} geminiApiKey={geminiApiKey} onApiKeyChange={setGeminiApiKey} />
          </div>

          {/* Results Section */}
          <div className="space-y-8">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-lg text-gray-600 font-medium">Searching papers...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50/50 backdrop-blur-sm border border-red-200/50 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-xl">⚠</span>
                </div>
                <p className="text-red-700 text-lg font-medium">{error}</p>
              </div>
            )}

            {searchResult && !loading && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Search Results
                    </h2>
                    <p className="text-lg text-gray-500">
                      {searchResult.total} papers found
                    </p>
                  </div>
                </div>

                {searchResult.papers.length === 0 ? (
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12 mb-8">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-600 mb-3">No papers found</h3>
                      <p className="text-gray-500 text-lg max-w-md mx-auto mb-8">
                        Try adjusting your search terms or use the suggestions below to find relevant papers
                      </p>
                    </div>
                    <SearchSuggestions 
                      onSuggestionClick={handleSuggestionClick}
                      currentQuery={currentQuery}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {searchResult.papers.map(paper => (
                      <PaperCard
                        key={paper.id}
                        paper={paper}
                        isBookmarked={isBookmarked(paper.id)}
                        onToggleBookmark={toggleBookmark}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      )}

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