import React, { useState } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { PaperCard } from './components/PaperCard';
import { BookmarkList } from './components/BookmarkList';
import { useSearch } from './hooks/useSearch';
import { useBookmarks } from './hooks/useBookmarks';
import { Loader2, Search, BookOpen } from 'lucide-react';

function App() {
  const { searchResult, loading, error, search } = useSearch();
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();
  const [showBookmarks, setShowBookmarks] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        bookmarkCount={bookmarks.length}
        onShowBookmarks={() => setShowBookmarks(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl">
              <Search className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Artiqle
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> AI</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Search across Semantic Scholar, arXiv, CrossRef, PubMed, OpenAlex, and CORE simultaneously. 
            Get comprehensive results with intelligent deduplication and relevance ranking.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['Semantic Scholar', 'arXiv', 'CrossRef', 'PubMed', 'OpenAlex'].map(source => (
              <span key={source} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {source}
              </span>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <SearchBar onSearch={search} loading={loading} />
        </div>

        {/* Results Section */}
        <div className="space-y-8">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
              <span className="text-lg text-gray-600">Searching papers...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {searchResult && !loading && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Search Results
                  <span className="text-lg font-normal text-gray-500 ml-2">
                    ({searchResult.total} papers found)
                  </span>
                </h2>
              </div>

              {searchResult.papers.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No papers found</h3>
                  <p className="text-gray-500">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {!searchResult && !loading && (
            <div className="text-center py-16">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-12 max-w-2xl mx-auto">
                <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Start Your Research Journey
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Enter keywords, author names, or research topics to discover relevant academic papers. 
                  Use the filter options to narrow down results by year, citation count, or research field.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

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