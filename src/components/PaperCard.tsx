import React, { memo, useCallback } from 'react';
import { ExternalLink, FileText, Bookmark, BookmarkCheck, Users, Calendar, Quote } from 'lucide-react';
import { Paper } from '../types/paper';

interface PaperCardProps {
  paper: Paper;
  isBookmarked: boolean;
  onToggleBookmark: (paper: Paper) => void;
}

export const PaperCard: React.FC<PaperCardProps> = memo(({ paper, isBookmarked, onToggleBookmark }) => {
  const formatCitationCount = useCallback((count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }, []);

  const handleToggleBookmark = useCallback(() => {
    onToggleBookmark(paper);
  }, [onToggleBookmark, paper]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 p-8 hover:shadow-2xl transition-all duration-500 hover:border-blue-200/50 group hover:scale-[1.02]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors leading-tight">
            {paper.title}
          </h3>
          
          <div className="flex items-center text-base text-gray-600 mb-3">
            <Users className="h-5 w-5 mr-2" />
            <span className="truncate font-medium">
              {paper.authors.slice(0, 3).join(', ')}
              {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
            </span>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="font-semibold">{paper.year}</span>
            </div>
            {paper.venue && (
              <span className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-semibold">
                {paper.venue}
              </span>
            )}
            <div className="flex items-center">
              <Quote className="h-4 w-4 mr-2" />
              <span className="font-semibold">{formatCitationCount(paper.citationCount)} citations</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleToggleBookmark}
          className={`ml-6 p-3 rounded-2xl transition-all duration-300 ${
            isBookmarked
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 shadow-lg'
              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md'
          }`}
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-6 w-6" />
          ) : (
            <Bookmark className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Abstract */}
      <p className="text-gray-700 text-base leading-relaxed mb-6 line-clamp-3">
        {paper.abstract}
      </p>

      {/* Fields */}
      {paper.fields && paper.fields.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {paper.fields.map(field => (
            <span
              key={field}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold"
            >
              {field}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-4 pt-6 border-t border-gray-100/50">
        {paper.url && (
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Paper
          </a>
        )}
        {paper.pdfUrl && (
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all duration-200"
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </a>
        )}
        {paper.doi && (
          <a
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 text-sm font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-200"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            DOI
          </a>
        )}
        <div className="flex-1" />
        <span className="text-xs font-bold text-gray-500 capitalize px-3 py-1.5 bg-gray-100 rounded-full">
          {paper.source.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
});