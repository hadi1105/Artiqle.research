import { Paper, SearchFilters, SearchResult } from '../types/paper';
import { SemanticScholarClient } from './apiClients/semanticScholarClient';
import { ArxivClient } from './apiClients/arxivClient';
import { CrossrefClient } from './apiClients/crossrefClient';
import { PubmedClient } from './apiClients/pubmedClient';
import { OpenAlexClient } from './apiClients/openalexClient';
import { CoreClient } from './apiClients/coreClient';

export class SearchService {
  static async searchPapers(query: string, filters: SearchFilters = {}): Promise<SearchResult> {
    if (!query.trim()) {
      return { papers: [], total: 0, query: '', hasMore: false };
    }

    const limit = 15; // Increased limit per API to get more diverse results
    const promises = [];

    // Determine which sources to search
    const sources = filters.sources || [
      'semantic-scholar', 
      'arxiv', 
      'crossref', 
      'pubmed', 
      'openalex',
      'biorxiv',
      'medrxiv',
      'chemrxiv',
      'ssrn'
      // 'core' // Commented out as it requires API key
    ];

    // Generate multiple query variations for better results
    const queryVariations = this.generateQueryVariations(query, filters);

    // Search each enabled source with multiple query variations
    if (sources.includes('semantic-scholar')) {
      queryVariations.forEach(variation => {
        promises.push(SemanticScholarClient.searchPapers(variation, Math.ceil(limit / queryVariations.length)));
      });
    }
    if (sources.includes('arxiv')) {
      queryVariations.forEach(variation => {
        promises.push(ArxivClient.searchPapers(variation, Math.ceil(limit / queryVariations.length)));
      });
    }
    if (sources.includes('crossref')) {
      queryVariations.forEach(variation => {
        promises.push(CrossrefClient.searchPapers(variation, Math.ceil(limit / queryVariations.length)));
      });
    }
    if (sources.includes('pubmed')) {
      queryVariations.forEach(variation => {
        promises.push(PubmedClient.searchPapers(variation, Math.ceil(limit / queryVariations.length)));
      });
    }
    if (sources.includes('openalex')) {
      queryVariations.forEach(variation => {
        promises.push(OpenAlexClient.searchPapers(variation, Math.ceil(limit / queryVariations.length)));
      });
    }
    if (sources.includes('core')) {
      queryVariations.forEach(variation => {
        promises.push(CoreClient.searchPapers(variation, Math.ceil(limit / queryVariations.length)));
      });
    }
    if (sources.includes('biorxiv')) {
      queryVariations.forEach(variation => {
        promises.push(this.searchBioRxiv(variation, Math.ceil(limit / queryVariations.length)));
      });
    }
    if (sources.includes('medrxiv')) {
      queryVariations.forEach(variation => {
        promises.push(this.searchMedRxiv(variation, Math.ceil(limit / queryVariations.length)));
      });
    }
    if (sources.includes('chemrxiv')) {
      queryVariations.forEach(variation => {
        promises.push(this.searchChemRxiv(variation, Math.ceil(limit / queryVariations.length)));
      });
    }
    if (sources.includes('ssrn')) {
      queryVariations.forEach(variation => {
        promises.push(this.searchSSRN(variation, Math.ceil(limit / queryVariations.length)));
      });
    }

    try {
      // Execute all searches in parallel
      const results = await Promise.allSettled(promises);
      
      console.log('Search results from all APIs:', results);
      
      // Combine results from all sources
      let allPapers: Paper[] = [];
      let totalCount = 0;

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          console.log(`API returned ${result.value.papers.length} papers`);
          allPapers = [...allPapers, ...result.value.papers];
          totalCount += result.value.total;
        } else {
          console.error('API search failed:', result.reason);
        }
      });

      console.log(`Total papers before deduplication: ${allPapers.length}`);
      
      // Remove duplicates based on title similarity and DOI
      const uniquePapers = this.removeDuplicates(allPapers);

      console.log(`Total papers after deduplication: ${uniquePapers.length}`);
      
      // Apply filters
      let filteredPapers = this.applyFilters(uniquePapers, filters);

      console.log(`Total papers after filtering: ${filteredPapers.length}`);
      
      // Sort by relevance (citation count and recency)
      filteredPapers = this.sortByRelevance(filteredPapers, query);

      return {
        papers: filteredPapers,
        total: filteredPapers.length,
        query,
        hasMore: false // For now, we don't implement pagination across multiple APIs
      };
    } catch (error) {
      console.error('Search service error:', error);
      throw new Error('Failed to search papers. Please try again.');
    }
  }

  private static removeDuplicates(papers: Paper[]): Paper[] {
    const seen = new Set<string>();
    const uniquePapers: Paper[] = [];

    for (const paper of papers) {
      // Create a key based on normalized title and DOI
      const normalizedTitle = paper.title.toLowerCase().replace(/[^\w\s]/g, '').trim();
      const key = paper.doi || normalizedTitle;

      if (!seen.has(key)) {
        seen.add(key);
        uniquePapers.push(paper);
      }
    }

    return uniquePapers;
  }

  private static applyFilters(papers: Paper[], filters: SearchFilters): Paper[] {
    let filtered = papers;

    if (filters.yearFrom) {
      filtered = filtered.filter(paper => paper.year >= filters.yearFrom!);
    }

    if (filters.yearTo) {
      filtered = filtered.filter(paper => paper.year <= filters.yearTo!);
    }

    if (filters.minCitations) {
      filtered = filtered.filter(paper => paper.citationCount >= filters.minCitations!);
    }

    if (filters.fields && filters.fields.length > 0) {
      filtered = filtered.filter(paper =>
        paper.fields?.some(field =>
          filters.fields!.some(filterField =>
            field.toLowerCase().includes(filterField.toLowerCase())
          )
        )
      );
    }

    return filtered;
  }

  private static sortByRelevance(papers: Paper[], query: string): Paper[] {
    const queryTerms = query.toLowerCase().split(/\s+/);

    return papers.sort((a, b) => {
      // Calculate relevance score
      const scoreA = this.calculateRelevanceScore(a, queryTerms);
      const scoreB = this.calculateRelevanceScore(b, queryTerms);

      return scoreB - scoreA;
    });
  }

  private static calculateRelevanceScore(paper: Paper, queryTerms: string[]): number {
    let score = 0;
    const titleLower = paper.title.toLowerCase();
    const abstractLower = paper.abstract.toLowerCase();

    // Title matches (highest weight)
    queryTerms.forEach(term => {
      if (titleLower.includes(term)) {
        score += 10;
      }
      if (abstractLower.includes(term)) {
        score += 5;
      }
    });

    // Citation count (normalized)
    score += Math.log(paper.citationCount + 1) * 2;

    // Recency bonus (papers from last 5 years get bonus)
    const currentYear = new Date().getFullYear();
    if (paper.year >= currentYear - 5) {
      score += 3;
    }

    // Source reliability bonus
    const sourceBonus = {
      'semantic-scholar': 2,
      'openalex': 2,
      'crossref': 1.5,
      'arxiv': 1,
      'pubmed': 1.5,
      'core': 1,
      'biorxiv': 1.2,
      'medrxiv': 1.2,
      'chemrxiv': 1.2,
      'ssrn': 1.1,
      'ieee': 1.8,
      'acm': 1.8,
      'springer': 1.6,
      'wiley': 1.6,
      'elsevier': 1.6,
      'jstor': 1.7,
      'sage': 1.5,
      'taylor': 1.5,
      'oxford': 1.7,
      'cambridge': 1.7
    };
    score += sourceBonus[paper.source] || 0;

    return score;
  }

  private static generateQueryVariations(query: string, filters: SearchFilters): string[] {
    const variations = [query]; // Start with original query
    
    // Add field-specific variations if fields are specified
    if (filters.fields && filters.fields.length > 0) {
      filters.fields.forEach(field => {
        variations.push(`${query} ${field}`);
        variations.push(`${field} ${query}`);
      });
    }

    // Add common synonyms and related terms
    const synonyms = this.getQuerySynonyms(query);
    variations.push(...synonyms);

    // Add medical/clinical variations for medical queries
    if (this.isMedicalQuery(query, filters)) {
      variations.push(`${query} clinical`);
      variations.push(`${query} treatment`);
      variations.push(`${query} diagnosis`);
      variations.push(`${query} therapy`);
    }

    // Add technical variations for CS/AI queries
    if (this.isTechnicalQuery(query, filters)) {
      variations.push(`${query} algorithm`);
      variations.push(`${query} model`);
      variations.push(`${query} method`);
      variations.push(`${query} approach`);
    }

    // Remove duplicates and limit to reasonable number
    return [...new Set(variations)].slice(0, 5);
  }

  private static getQuerySynonyms(query: string): string[] {
    const synonymMap: { [key: string]: string[] } = {
      'machine learning': ['ML', 'artificial intelligence', 'AI', 'deep learning', 'neural networks'],
      'artificial intelligence': ['AI', 'machine learning', 'ML', 'intelligent systems'],
      'neural networks': ['deep learning', 'neural nets', 'NN', 'deep neural networks'],
      'cancer': ['oncology', 'tumor', 'carcinoma', 'neoplasm', 'malignancy'],
      'heart disease': ['cardiology', 'cardiovascular', 'cardiac', 'heart failure'],
      'diabetes': ['diabetic', 'glucose', 'insulin', 'metabolic syndrome'],
      'depression': ['mental health', 'mood disorder', 'major depressive disorder'],
      'covid': ['coronavirus', 'SARS-CoV-2', 'pandemic', 'COVID-19'],
      'climate change': ['global warming', 'environmental change', 'greenhouse effect'],
      'renewable energy': ['solar', 'wind', 'clean energy', 'sustainable energy']
    };

    const lowerQuery = query.toLowerCase();
    for (const [key, synonyms] of Object.entries(synonymMap)) {
      if (lowerQuery.includes(key)) {
        return synonyms.map(synonym => query.replace(new RegExp(key, 'gi'), synonym));
      }
    }

    return [];
  }

  private static isMedicalQuery(query: string, filters: SearchFilters): boolean {
    const medicalTerms = [
      'medicine', 'medical', 'clinical', 'patient', 'treatment', 'therapy', 'diagnosis',
      'disease', 'cancer', 'heart', 'diabetes', 'depression', 'covid', 'virus',
      'drug', 'pharmaceutical', 'surgery', 'hospital', 'health', 'cure'
    ];
    
    const queryLower = query.toLowerCase();
    const hasMedicalTerms = medicalTerms.some(term => queryLower.includes(term));
    const hasMedicalFields = filters.fields?.some(field => 
      ['Medicine', 'Clinical Medicine', 'Public Health', 'Pharmacology', 'Neuroscience'].includes(field)
    );
    
    return hasMedicalTerms || hasMedicalFields || false;
  }

  private static isTechnicalQuery(query: string, filters: SearchFilters): boolean {
    const technicalTerms = [
      'algorithm', 'model', 'neural', 'machine learning', 'AI', 'data', 'software',
      'computer', 'programming', 'code', 'system', 'network', 'database'
    ];
    
    const queryLower = query.toLowerCase();
    const hasTechnicalTerms = technicalTerms.some(term => queryLower.includes(term));
    const hasTechnicalFields = filters.fields?.some(field => 
      ['Machine Learning', 'Computer Science', 'Software Engineering', 'Data Science'].includes(field)
    );
    
    return hasTechnicalTerms || hasTechnicalFields || false;
  }

  // Preprint search methods
  private static async searchBioRxiv(query: string, limit = 20): Promise<APIResponse> {
    try {
      const response = await fetch(`https://api.biorxiv.org/details/biorxiv/${encodeURIComponent(query)}/0/${limit}/json`);
      if (!response.ok) return { papers: [], total: 0, hasMore: false };
      
      const data = await response.json();
      const papers: Paper[] = data.collection?.map((item: any) => ({
        id: `biorxiv-${item.doi}`,
        title: item.title || 'Untitled',
        authors: item.authors?.split(';').map((a: string) => a.trim()) || [],
        abstract: item.abstract || 'No abstract available',
        year: new Date(item.date).getFullYear() || 0,
        venue: 'bioRxiv',
        citationCount: 0,
        url: `https://www.biorxiv.org/content/${item.doi}`,
        pdfUrl: `https://www.biorxiv.org/content/${item.doi}.full.pdf`,
        fields: ['Biology'],
        source: 'biorxiv' as const,
        doi: item.doi
      })) || [];

      return { papers, total: papers.length, hasMore: false };
    } catch (error) {
      console.error('bioRxiv search error:', error);
      return { papers: [], total: 0, hasMore: false };
    }
  }

  private static async searchMedRxiv(query: string, limit = 20): Promise<APIResponse> {
    try {
      const response = await fetch(`https://api.medrxiv.org/details/medrxiv/${encodeURIComponent(query)}/0/${limit}/json`);
      if (!response.ok) return { papers: [], total: 0, hasMore: false };
      
      const data = await response.json();
      const papers: Paper[] = data.collection?.map((item: any) => ({
        id: `medrxiv-${item.doi}`,
        title: item.title || 'Untitled',
        authors: item.authors?.split(';').map((a: string) => a.trim()) || [],
        abstract: item.abstract || 'No abstract available',
        year: new Date(item.date).getFullYear() || 0,
        venue: 'medRxiv',
        citationCount: 0,
        url: `https://www.medrxiv.org/content/${item.doi}`,
        pdfUrl: `https://www.medrxiv.org/content/${item.doi}.full.pdf`,
        fields: ['Medicine'],
        source: 'medrxiv' as const,
        doi: item.doi
      })) || [];

      return { papers, total: papers.length, hasMore: false };
    } catch (error) {
      console.error('medRxiv search error:', error);
      return { papers: [], total: 0, hasMore: false };
    }
  }

  private static async searchChemRxiv(query: string, limit = 20): Promise<APIResponse> {
    try {
      const response = await fetch(`https://api.chemrxiv.org/details/chemrxiv/${encodeURIComponent(query)}/0/${limit}/json`);
      if (!response.ok) return { papers: [], total: 0, hasMore: false };
      
      const data = await response.json();
      const papers: Paper[] = data.collection?.map((item: any) => ({
        id: `chemrxiv-${item.doi}`,
        title: item.title || 'Untitled',
        authors: item.authors?.split(';').map((a: string) => a.trim()) || [],
        abstract: item.abstract || 'No abstract available',
        year: new Date(item.date).getFullYear() || 0,
        venue: 'chemRxiv',
        citationCount: 0,
        url: `https://chemrxiv.org/engage/chemrxiv/article-details/${item.doi}`,
        pdfUrl: `https://chemrxiv.org/engage/chemrxiv/article-details/${item.doi}`,
        fields: ['Chemistry'],
        source: 'chemrxiv' as const,
        doi: item.doi
      })) || [];

      return { papers, total: papers.length, hasMore: false };
    } catch (error) {
      console.error('chemRxiv search error:', error);
      return { papers: [], total: 0, hasMore: false };
    }
  }

  private static async searchSSRN(query: string, limit = 20): Promise<APIResponse> {
    try {
      // SSRN doesn't have a public API, so we'll return empty results for now
      // In a real implementation, you would use web scraping or a service like SerpAPI
      console.log('SSRN search (not implemented):', query);
      return { papers: [], total: 0, hasMore: false };
    } catch (error) {
      console.error('SSRN search error:', error);
      return { papers: [], total: 0, hasMore: false };
    }
  }
}