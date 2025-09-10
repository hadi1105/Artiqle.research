import { Paper, APIResponse } from '../../types/paper';

const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export class PubmedClient {
  static async searchPapers(query: string, limit = 20, offset = 0): Promise<APIResponse> {
    try {
      // First, search for PMIDs
      const searchParams = new URLSearchParams({
        db: 'pubmed',
        term: query,
        retmax: limit.toString(),
        retstart: offset.toString(),
        retmode: 'json'
      });

      const searchResponse = await fetch(`${BASE_URL}/esearch.fcgi?${searchParams}`);
      
      if (!searchResponse.ok) {
        throw new Error(`PubMed search error: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      const pmids = searchData.esearchresult?.idlist || [];
      
      if (pmids.length === 0) {
        return { papers: [], total: 0, hasMore: false };
      }

      // Then fetch details for those PMIDs
      const summaryParams = new URLSearchParams({
        db: 'pubmed',
        id: pmids.join(','),
        retmode: 'json'
      });

      const summaryResponse = await fetch(`${BASE_URL}/esummary.fcgi?${summaryParams}`);
      
      if (!summaryResponse.ok) {
        throw new Error(`PubMed summary error: ${summaryResponse.status}`);
      }

      const summaryData = await summaryResponse.json();
      const results = summaryData.result || {};
      
      const papers: Paper[] = pmids.map((pmid: string) => {
        const paper = results[pmid];
        if (!paper) return null;
        
        const authors = paper.authors?.map((author: any) => author.name) || [];
        const year = paper.pubdate ? parseInt(paper.pubdate.split(' ')[0]) : 0;
        
        return {
          id: `pubmed-${pmid}`,
          title: paper.title || 'Untitled',
          authors,
          abstract: 'Abstract available on PubMed', // PubMed API doesn't include full abstracts in summary
          year,
          venue: paper.source,
          citationCount: 0, // PubMed doesn't provide citation counts
          url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
          fields: [],
          source: 'pubmed' as const,
          pmid
        };
      }).filter(Boolean) as Paper[];

      const total = parseInt(searchData.esearchresult?.count || '0');

      return {
        papers,
        total,
        hasMore: total > offset + limit,
        nextOffset: offset + limit
      };
    } catch (error) {
      console.error('PubMed API error:', error);
      return { papers: [], total: 0, hasMore: false };
    }
  }
}