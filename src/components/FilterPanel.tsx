import React from 'react';
import { X } from 'lucide-react';
import { SearchFilters } from '../types/paper';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClose: () => void;
}

const RESEARCH_SOURCES = [
  { id: 'semantic-scholar', name: 'Semantic Scholar', description: 'AI-powered academic search' },
  { id: 'arxiv', name: 'arXiv', description: 'Preprints in physics, math, CS' },
  { id: 'crossref', name: 'CrossRef', description: 'DOI database' },
  { id: 'pubmed', name: 'PubMed', description: 'Biomedical literature' },
  { id: 'openalex', name: 'OpenAlex', description: 'Open academic database' },
  { id: 'core', name: 'CORE', description: 'Open access papers' }
];

const RESEARCH_FIELDS = [
  'Machine Learning', 'Natural Language Processing', 'Computer Vision', 'Artificial Intelligence',
  'Medicine', 'Clinical Medicine', 'Public Health', 'Neuroscience', 'Cardiology', 'Oncology',
  'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Psychology', 'Economics'
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSourceChange = (sourceId: string, checked: boolean) => {
    const currentSources = filters.sources || [];
    const newSources = checked
      ? [...currentSources, sourceId]
      : currentSources.filter(s => s !== sourceId);
    updateFilter('sources', newSources);
  };

  const handleFieldChange = (field: string, checked: boolean) => {
    const currentFields = filters.fields || [];
    const newFields = checked
      ? [...currentFields, field]
      : currentFields.filter(f => f !== field);
    updateFilter('fields', newFields);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <div className="border-t border-gray-100 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Search Filters</h3>
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Year Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Publication Year
            </label>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="From year"
                value={filters.yearFrom || ''}
                onChange={(e) => updateFilter('yearFrom', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="To year"
                value={filters.yearTo || ''}
                onChange={(e) => updateFilter('yearTo', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Data Sources
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {RESEARCH_SOURCES.map(source => (
                <label key={source.id} className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={(filters.sources || []).includes(source.id)}
                    onChange={(e) => handleSourceChange(source.id, e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-700">{source.name}</div>
                    <div className="text-xs text-gray-500">{source.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Research Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Research Fields
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {RESEARCH_FIELDS.map(field => (
                <label key={field} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(filters.fields || []).includes(field)}
                    onChange={(e) => handleFieldChange(field, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{field}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};