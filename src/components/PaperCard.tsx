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
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
            {paper.title}
          </h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Users className="h-4 w-4 mr-2" />
            <span className="truncate">
              {paper.authors.slice(0, 3).join(', ')}
              {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{paper.year}</span>
            </div>
            {paper.venue && (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                {paper.venue}
              </span>
            )}
            <div className="flex items-center">
              <Quote className="h-4 w-4 mr-1" />
              <span>{formatCitationCount(paper.citationCount)} citations</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleToggleBookmark}
          className={`p-2 rounded-lg transition-colors ${
            isBookmarked
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-5 w-5" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Abstract */}
      <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
        {paper.abstract}
      </p>

      {/* Fields */}
      {paper.fields && paper.fields.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {paper.fields.slice(0, 4).map(field => (
            <span
              key={field}
              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
            >
              {field}
            </span>
          ))}
          {paper.fields.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              +{paper.fields.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          {paper.url && (
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View Paper
            </a>
          )}
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-green-600 hover:text-green-700"
            >
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </a>
          )}
        </div>
        
        <span className="text-xs text-gray-500 font-medium capitalize">
          {paper.source.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
});