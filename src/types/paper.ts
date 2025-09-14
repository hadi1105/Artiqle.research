export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  venue?: string;
  citationCount: number;
  url?: string;
  pdfUrl?: string;
  fields?: string[];
  source: 'semantic-scholar' | 'arxiv' | 'crossref' | 'pubmed' | 'openalex' | 'core' | 
          'medline' | 'cochrane' | 'embase' | 'psycinfo' | 'cinahl' | 'ieee' | 'acm' | 
          'springer' | 'wiley' | 'elsevier' | 'jstor' | 'sage' | 'taylor' | 'oxford' | 
          'cambridge' | 'doaj' | 'biorxiv' | 'medrxiv' | 'chemrxiv' | 'ssrn' | 'govinfo' | 
          'eric' | 'agris' | 'repec' | 'dblp';
  doi?: string;
  pmid?: string;
  arxivId?: string;
  openAlexId?: string;
  coreId?: string;
}

export interface SearchFilters {
  yearFrom?: number;
  yearTo?: number;
  minCitations?: number;
  fields?: string[];
  sources?: string[];
}

export interface SearchResult {
  papers: Paper[];
  total: number;
  query: string;
  hasMore: boolean;
  nextOffset?: number;
}

export interface APIResponse {
  papers: Paper[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}