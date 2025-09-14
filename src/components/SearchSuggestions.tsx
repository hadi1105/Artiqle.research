import React from 'react';
import { Search, BookOpen, ExternalLink, Lightbulb } from 'lucide-react';

interface SearchSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  currentQuery?: string;
}

const SUGGESTED_QUERIES = {
  'Machine Learning': [
    'deep learning neural networks',
    'computer vision object detection',
    'natural language processing transformers',
    'reinforcement learning algorithms',
    'machine learning in healthcare'
  ],
  'Medicine': [
    'cancer treatment immunotherapy',
    'diabetes management guidelines',
    'heart disease prevention',
    'mental health depression treatment',
    'COVID-19 vaccine efficacy'
  ],
  'Physics': [
    'quantum computing applications',
    'renewable energy solar cells',
    'climate change global warming',
    'particle physics Higgs boson',
    'astrophysics black holes'
  ],
  'Chemistry': [
    'green chemistry sustainability',
    'drug discovery pharmaceutical',
    'materials science nanotechnology',
    'catalysis chemical reactions',
    'biochemistry protein structure'
  ],
  'Biology': [
    'genetics CRISPR gene editing',
    'evolution natural selection',
    'ecology biodiversity conservation',
    'microbiology antibiotic resistance',
    'neuroscience brain function'
  ]
};

const ALTERNATIVE_STRATEGIES = [
  {
    title: 'Try Broader Terms',
    description: 'Use more general keywords instead of specific technical terms',
    example: 'Instead of "BERT transformer", try "natural language processing"'
  },
  {
    title: 'Use Synonyms',
    description: 'Try different words that mean the same thing',
    example: 'Instead of "cancer", try "oncology" or "tumor"'
  },
  {
    title: 'Add Field Context',
    description: 'Include the research field in your search',
    example: 'Instead of "machine learning", try "machine learning medicine"'
  },
  {
    title: 'Try Recent Years',
    description: 'Focus on papers from the last 5 years for more results',
    example: 'Set year filter to 2020-2024'
  },
  {
    title: 'Use Multiple Sources',
    description: 'Enable all available search sources for better coverage',
    example: 'Check all data sources in the filter panel'
  }
];

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ 
  onSuggestionClick, 
  currentQuery 
}) => {
  const getRelevantSuggestions = () => {
    if (!currentQuery) return SUGGESTED_QUERIES['Machine Learning'];
    
    const queryLower = currentQuery.toLowerCase();
    
    // Find the most relevant category
    for (const [category, suggestions] of Object.entries(SUGGESTED_QUERIES)) {
      if (queryLower.includes(category.toLowerCase()) || 
          suggestions.some(s => queryLower.includes(s.split(' ')[0]))) {
        return suggestions;
      }
    }
    
    return SUGGESTED_QUERIES['Machine Learning'];
  };

  return (
    <div className="space-y-8">
      {/* Suggested Queries */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          Suggested Searches
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {getRelevantSuggestions().map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="text-left p-3 bg-gradient-to-r from-white to-blue-50/50 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 group"
            >
              <div className="flex items-center">
                <Search className="h-4 w-4 text-gray-400 mr-2 group-hover:text-blue-500" />
                <span className="text-sm text-gray-700 group-hover:text-blue-700">
                  {suggestion}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Alternative Strategies */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
          Search Tips
        </h3>
        <div className="space-y-3">
          {ALTERNATIVE_STRATEGIES.map((strategy, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-lg"
            >
              <h4 className="font-medium text-gray-900 mb-1">{strategy.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
              <p className="text-xs text-blue-600 italic">Example: {strategy.example}</p>
            </div>
          ))}
        </div>
      </div>

      {/* External Resources */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ExternalLink className="h-5 w-5 mr-2 text-green-500" />
          Alternative Search Engines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href="https://scholar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-gradient-to-r from-white to-green-50/50 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-300 group"
          >
            <div className="flex items-center">
              <ExternalLink className="h-4 w-4 text-gray-400 mr-2 group-hover:text-green-500" />
              <span className="text-sm text-gray-700 group-hover:text-green-700">
                Google Scholar
              </span>
            </div>
          </a>
          <a
            href="https://www.researchgate.net"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-gradient-to-r from-white to-green-50/50 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-300 group"
          >
            <div className="flex items-center">
              <ExternalLink className="h-4 w-4 text-gray-400 mr-2 group-hover:text-green-500" />
              <span className="text-sm text-gray-700 group-hover:text-green-700">
                ResearchGate
              </span>
            </div>
          </a>
          <a
            href="https://www.jstor.org"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-gradient-to-r from-white to-green-50/50 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-300 group"
          >
            <div className="flex items-center">
              <ExternalLink className="h-4 w-4 text-gray-400 mr-2 group-hover:text-green-500" />
              <span className="text-sm text-gray-700 group-hover:text-green-700">
                JSTOR
              </span>
            </div>
          </a>
          <a
            href="https://www.academia.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-gradient-to-r from-white to-green-50/50 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-300 group"
          >
            <div className="flex items-center">
              <ExternalLink className="h-4 w-4 text-gray-400 mr-2 group-hover:text-green-500" />
              <span className="text-sm text-gray-700 group-hover:text-green-700">
                Academia.edu
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
