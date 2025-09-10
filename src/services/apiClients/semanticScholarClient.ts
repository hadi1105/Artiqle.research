import { Paper, APIResponse } from '../../types/paper';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

export class SemanticScholarClient {
  static async searchPapers(query: string, limit = 20, offset = 0): Promise<APIResponse> {
    try {
      const params = new URLSearchParams({
        query,
        limit: limit.toString(),
        offset: offset.toString(),
        fields: 'paperId,title,authors,abstract,year,venue,citationCount,url,openAccessPdf,fieldsOfStudy'
      });

      const response = await fetch(`${BASE_URL}/paper/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Semantic Scholar API error: ${response.status}`);
      }

      const data = await response.json();
      
      const papers: Paper[] = data.data?.map((paper: any) => ({
        id: `ss-${paper.paperId}`,
        title: paper.title || 'Untitled',
        authors: paper.authors?.map((author: any) => author.name) || [],
        abstract: paper.abstract || 'No abstract available',
        year: paper.year || 0,
        venue: paper.venue,
        citationCount: paper.citationCount || 0,
        url: paper.url,
        pdfUrl: paper.openAccessPdf?.url,
        fields: paper.fieldsOfStudy || [],
        source: 'semantic-scholar' as const
      })) || [];

      return {
        papers,
        total: data.total || 0,
        hasMore: data.total > offset + limit,
        nextOffset: offset + limit
      };
    } catch (error) {
      console.error('Semantic Scholar API error:', error);
      return { papers: [], total: 0, hasMore: false };
    }
  }
}