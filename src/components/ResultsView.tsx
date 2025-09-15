import React from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';
import { SearchResult, Paper } from '../types/paper';
import { PaperCard } from './PaperCard';
import { SearchSuggestions } from './SearchSuggestions';

interface ResultsViewProps {
  searchResult: SearchResult | null;
  loading: boolean;
  error: string | null;
  currentQuery?: string;
  hasSearched: boolean;
  bookmarks: Paper[];
  isBookmarked: (paperId: string) => boolean;
  onToggleBookmark: (paper: Paper) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  searchResult,
  loading,
  error,
  currentQuery,
  hasSearched,
  bookmarks,
  isBookmarked,
  onToggleBookmark
}) => {
  // Don't render anything if no search has been made
  if (!hasSearched) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Searching academic papers...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Results */}
        {searchResult && !loading && (
          <>
            {/* Results Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Search Results
              </h2>
              <p className="text-gray-600">
                Found {searchResult.total} papers for "{currentQuery}"
              </p>
            </div>

            {/* No Results */}
            {searchResult.papers.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No papers found</h3>
                <p className="text-gray-500 mb-8">
                  Try adjusting your search terms or explore the suggestions below
                </p>
                <SearchSuggestions 
                  onSuggestionClick={(suggestion) => {
                    // This would need to be passed down from parent
                    console.log('Suggestion clicked:', suggestion);
                  }}
                  currentQuery={currentQuery}
                />
              </div>
            ) : (
              /* Results List */
              <div className="space-y-6">
                {searchResult.papers.map(paper => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    isBookmarked={isBookmarked(paper.id)}
                    onToggleBookmark={onToggleBookmark}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};