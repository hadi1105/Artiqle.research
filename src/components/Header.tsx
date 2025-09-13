import React from 'react';
import { BookOpen, BookmarkCheck } from 'lucide-react';

interface HeaderProps {
  bookmarkCount: number;
  onShowBookmarks: () => void;
}

export const Header: React.FC<HeaderProps> = ({ bookmarkCount, onShowBookmarks }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Artiqle
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI</span>
              </h1>
              <p className="text-sm text-gray-500 font-medium">Research Assistant</p>
            </div>
          </div>

          {/* Bookmarks Button */}
          <button
            onClick={onShowBookmarks}
            className="group flex items-center px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 rounded-2xl transition-all duration-300 relative border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg"
          >
            <BookmarkCheck className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm">Bookmarks</span>
            {bookmarkCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-scale-in">
                {bookmarkCount > 99 ? '99+' : bookmarkCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};