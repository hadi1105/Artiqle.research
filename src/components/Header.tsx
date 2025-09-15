import React from 'react';
import { Microscope, BookmarkCheck } from 'lucide-react';

interface HeaderProps {
  bookmarkCount: number;
  onShowBookmarks: () => void;
  onGoToLanding: () => void;
  hasSearched: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  bookmarkCount, 
  onShowBookmarks, 
  onGoToLanding,
  hasSearched 
}) => {
  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6">
      {/* Logo */}
      <button 
        onClick={onGoToLanding}
        className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Microscope className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-semibold text-gray-900">
          Artiqle<span className="text-blue-600">AI</span>
        </span>
      </button>

      {/* Bookmarks Button - Only show when there are searches */}
      {hasSearched && (
        <button
          onClick={onShowBookmarks}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors relative"
        >
          <BookmarkCheck className="h-5 w-5" />
          <span className="text-sm font-medium">Bookmarks</span>
          {bookmarkCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {bookmarkCount > 99 ? '99+' : bookmarkCount}
            </span>
          )}
        </button>
      )}
    </header>
  );
};