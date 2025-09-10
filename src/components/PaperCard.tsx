import React from 'react';
import { ExternalLink, FileText, Bookmark, BookmarkCheck, Users, Calendar, Quote } from 'lucide-react';
import { Paper } from '../types/paper';

interface PaperCardProps {
  paper: Paper;
  isBookmarked: boolean;
  onToggleBookmark: (paper: Paper) => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper, isBookmarked, onToggleBookmark }) => {
  const formatCitationCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors leading-tight">
            {paper.title}
          </h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Users className="h-4 w-4 mr-1" />
            <span className="truncate">
              {paper.authors.slice(0, 3).join(', ')}
              {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {paper.year}
            </div>
            {paper.venue && (
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                {paper.venue}
              </span>
            )}
            <div className="flex items-center">
              <Quote className="h-4 w-4 mr-1" />
              {formatCitationCount(paper.citationCount)} citations
            </div>
          </div>
        </div>

        <button
          onClick={() => onToggleBookmark(paper)}
          className={`ml-4 p-2 rounded-lg transition-all duration-200 ${
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
          {paper.fields.map(field => (
            <span
              key={field}
              className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium"
            >
              {field}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
        {paper.url && (
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
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
            className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <FileText className="h-4 w-4 mr-1" />
            PDF
          </a>
        )}
        {paper.doi && (
          <a
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            DOI
          </a>
        )}
        <div className="flex-1" />
        <span className="text-xs text-gray-400 capitalize px-2 py-1 bg-gray-50 rounded-full">
          {paper.source.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
};