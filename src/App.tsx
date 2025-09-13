import React, { useState } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { PaperCard } from './components/PaperCard';
import { BookmarkList } from './components/BookmarkList';
import { useSearch } from './hooks/useSearch';
import { useBookmarks } from './hooks/useBookmarks';
import { Loader2, Search, BookOpen, Sparkles } from 'lucide-react';

function App() {
  const { searchResult, loading, error, search } = useSearch();
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (query: string, filters: any) => {
    setHasSearched(true);
    search(query, filters);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        bookmarkCount={bookmarks.length}
        onShowBookmarks={() => setShowBookmarks(true)}
      />

      {/* Animated Landing Page - Only shows before first search */}
      {!hasSearched && !loading && (
        <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
          {/* Animated Gradient Background - Full Window */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-bounce"></div>
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-300/30 rounded-full blur-3xl animate-bounce" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/30 rounded-full blur-3xl animate-bounce" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>

          {/* Landing Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
            {/* Main Heading with Inline Search Icon */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl mr-4">
                  <Search className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Artiqle
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-pulse">
                  AI
                </span>
              </h1>
            </div>

            {/* Highlight Subtitle */}
            <p className="text-3xl md:text-4xl text-gray-600 mb-8 font-light leading-relaxed">
              Your Personal Research Assistant
            </p>

            {/* Description */}
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              Discover academic papers across multiple databases with intelligent search, 
              smart filtering, and comprehensive results in one place.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {['Semantic Scholar', 'arXiv', 'CrossRef', 'PubMed', 'OpenAlex'].map((source, index) => (
                <div
                  key={source}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full text-sm font-medium shadow-lg border border-white/20"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {source}
                </div>
              ))}
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchBar onSearch={handleSearch} loading={loading} />
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-10 text-blue-400/20 animate-float">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="absolute top-40 right-16 text-indigo-400/20 animate-float" style={{ animationDelay: '1s' }}>
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="absolute bottom-32 left-20 text-purple-400/20 animate-float" style={{ animationDelay: '2s' }}>
              <Search className="h-7 w-7" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Only shows after first search */}
      {hasSearched && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="mb-12">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>

          {/* Results Section */}
          <div className="space-y-8">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
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
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-600 mb-3">No papers found</h3>
                    <p className="text-gray-500 text-lg max-w-md mx-auto">
                      Try adjusting your search terms or filters to find relevant papers
                    </p>
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
          onClose={() => setShowBookmarks(false)}
        />
      )}
    </div>
  );
}

export default App;