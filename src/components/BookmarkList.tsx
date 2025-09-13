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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-200/50">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200/50">
          <div className="flex items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-sm opacity-75"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                <BookmarkCheck className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 ml-4">
              Bookmarked Papers ({bookmarks.length})
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            {bookmarks.length > 0 && (
              <button
                onClick={exportBookmarks}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Download className="h-5 w-5 mr-2" />
                <span className="font-semibold">Export</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          {bookmarks.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookmarkCheck className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-3">No bookmarks yet</h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                Start bookmarking papers to build your research collection
              </p>
            </div>
          ) : (
            <div className="space-y-8">
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