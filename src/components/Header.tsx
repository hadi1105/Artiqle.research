import React from 'react';
import { BookOpen, BookmarkCheck } from 'lucide-react';

interface HeaderProps {
  bookmarkCount: number;
  onShowBookmarks: () => void;
}

export const Header: React.FC<HeaderProps> = ({ bookmarkCount, onShowBookmarks }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Artiqle</h1>
              <p className="text-xs text-gray-500">Semantic paper discovery</p>
            </div>
          </div>

          {/* Bookmarks Button */}
          <button
            onClick={onShowBookmarks}
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors relative"
          >
            <BookmarkCheck className="h-5 w-5 mr-2" />
            <span className="font-medium">Bookmarks</span>
            {bookmarkCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {bookmarkCount > 99 ? '99+' : bookmarkCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};