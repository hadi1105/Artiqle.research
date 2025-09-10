import React from 'react';
import { BookmarkCheck, Download, X } from 'lucide-react';
import { Paper } from '../types/paper';
import { PaperCard } from './PaperCard';

interface BookmarkListProps {
  bookmarks: Paper[];
  onToggleBookmark: (paper: Paper) => void;
  onClose: () => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onToggleBookmark, onClose }) => {
  const exportBookmarks = () => {
    const exportData = bookmarks.map(paper => ({
      title: paper.title,
      authors: paper.authors.join(', '),
      year: paper.year,
      venue: paper.venue,
      url: paper.url,
      abstract: paper.abstract
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'research-bookmarks.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <BookmarkCheck className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">
              Bookmarked Papers ({bookmarks.length})
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {bookmarks.length > 0 && (
              <button
                onClick={exportBookmarks}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <BookmarkCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookmarks yet</h3>
              <p className="text-gray-500">
                Start bookmarking papers to build your research collection
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookmarks.map(paper => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  isBookmarked={true}
                  onToggleBookmark={onToggleBookmark}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};