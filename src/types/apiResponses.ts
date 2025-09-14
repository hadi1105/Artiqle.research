// API Response types for different academic databases

export interface BioRxivPaper {
  title: string;
  abstract: string;
  authors: string;
  date: string;
  doi: string;
  category: string;
  authors_parsed: Array<{
    first: string;
    last: string;
    middle: string[];
  }>;
}

export interface BioRxivResponse {
  messages: BioRxivPaper[];
  feed: {
    title: string;
    subtitle: string;
    link: string;
    updated: string;
    id: string;
  };
}

export interface MedRxivPaper {
  title: string;
  abstract: string;
  authors: string;
  date: string;
  doi: string;
  category: string;
  authors_parsed: Array<{
    first: string;
    last: string;
    middle: string[];
  }>;
}

export interface MedRxivResponse {
  messages: MedRxivPaper[];
  feed: {
    title: string;
    subtitle: string;
    link: string;
    updated: string;
    id: string;
  };
}

export interface CrossrefWork {
  DOI: string;
  title: string[];
  author: Array<{
    given?: string;
    family?: string;
    name?: string;
  }>;
  'container-title': string[];
  published: {
    'date-parts': number[][];
  };
  created?: {
    'date-parts': number[][];
  };
  'abstract': string;
  'reference-count': number;
  'is-referenced-by-count': number;
  URL: string;
  publisher?: string;
  subject?: string[];
}

export interface CrossrefResponse {
  'message-type': string;
  'message-version': string;
  message: {
    'total-results': number;
    'items-per-page': number;
    'query': {
      'start-index': number;
      'search-terms': string;
    };
    'items': CrossrefWork[];
  };
}

export interface OpenAlexWork {
  id: string;
  title: string;
  abstract_inverted_index: Record<string, number[]>;
  abstract?: string;
  authorships: Array<{
    author: {
      display_name: string;
    };
  }>;
  publication_date: string;
  publication_year?: number;
  primary_location?: {
    source?: {
      display_name: string;
    };
    landing_page_url?: string;
  };
  cited_by_count: number;
  doi?: string;
  open_access?: {
    is_oa: boolean;
    oa_url?: string;
  };
  concepts?: Array<{
    display_name: string;
  }>;
}

export interface OpenAlexResponse {
  results: OpenAlexWork[];
  meta: {
    count: number;
    page: number;
    per_page: number;
  };
}

export interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract: string;
  authors: Array<{
    authorId: string;
    name: string;
    displayName?: string;
  }>;
  year: number;
  venue: string;
  citationCount: number;
  openAccessPdf?: {
    url: string;
  };
  url: string;
  fieldsOfStudy: string[];
  externalIds: {
    DOI?: string;
    PubMed?: string;
    arXiv?: string;
  };
  doi?: string;
}

export interface SemanticScholarResponse {
  data: SemanticScholarPaper[];
  total: number;
  offset: number;
  next: number;
}

export interface PubMedArticle {
  uid: string;
  title: string;
  abstract: string;
  authors: Array<{
    name: string;
    authtype: string;
  }>;
  pubdate: string;
  source: string;
  doi: string;
  pmid: string;
}

export interface PubMedResponse {
  esearchresult: {
    count: string;
    retmax: string;
    retstart: string;
    idlist: string[];
  };
  articles: PubMedArticle[];
}

export interface CoreWork {
  id: string;
  title: string;
  abstract: string;
  description?: string;
  authors: Array<{
    name: string;
  }>;
  yearPublished: number;
  publisher: string;
  downloadUrl: string;
  doi: string;
  fullText: string;
  journals?: Array<{
    title: string;
  }>;
  urls?: string[];
  subjects?: string[];
}

export interface CoreResponse {
  data: CoreWork[];
  totalHits: number;
  page: number;
  pageSize: number;
}

export interface PlosArticle {
  id: string;
  title: string | string[];
  abstract: string | string[];
  author_display?: string[];
  author?: string | string[];
  publication_date: string;
  journal: string;
  article_type: string;
  metrics?: {
    views: number;
    citations: number;
  };
  url?: string;
  doi?: string;
}

export interface PlosResponse {
  response: {
    docs: PlosArticle[];
    numFound: number;
    start: number;
  };
}
