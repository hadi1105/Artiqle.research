import React from 'react';
import { Microscope, BookmarkCheck } from 'lucide-react';

interface HeaderProps {
  bookmarkCount: number;
  onShowBookmarks: () => void;
  onGoToLanding: () => void;
}

export const Header: React.FC<HeaderProps> = ({ bookmarkCount, onShowBookmarks, onGoToLanding }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={onGoToLanding}
            className="flex items-center hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg p-1"
          >
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
              <Microscope className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3 text-left">
              <h1 className="text-xl font-semibold text-slate-900">
                Artiqle
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold">AI</span>
              </h1>
              <h2 className="text-xs text-slate-500 font-medium">Research Assistant</h2>
            </div>
          </button>

          {/* Bookmarks Button */}
          <button
            onClick={onShowBookmarks}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-slate-700 hover:text-slate-900 rounded-lg border border-blue-200 hover:border-blue-300 relative shadow-sm"
          >
            <BookmarkCheck className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Bookmarks</span>
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                {bookmarkCount > 99 ? '99+' : bookmarkCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};