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

    const limit = 10; // Limit per API to get diverse results
    const promises = [];

    // Determine which sources to search
    const sources = filters.sources || [
      'semantic-scholar', 
      'arxiv', 
      'crossref', 
      'pubmed', 
      'openalex'
      // 'core' // Commented out as it requires API key
    ];

    // Search each enabled source
    if (sources.includes('semantic-scholar')) {
      promises.push(SemanticScholarClient.searchPapers(query, limit));
    }
    if (sources.includes('arxiv')) {
      promises.push(ArxivClient.searchPapers(query, limit));
    }
    if (sources.includes('crossref')) {
      promises.push(CrossrefClient.searchPapers(query, limit));
    }
    if (sources.includes('pubmed')) {
      promises.push(PubmedClient.searchPapers(query, limit));
    }
    if (sources.includes('openalex')) {
      promises.push(OpenAlexClient.searchPapers(query, limit));
    }
    if (sources.includes('core')) {
      promises.push(CoreClient.searchPapers(query, limit));
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
      'core': 1
    };
    score += sourceBonus[paper.source] || 0;

    return score;
  }
}