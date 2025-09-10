import { Paper, APIResponse } from '../../types/paper';

const BASE_URL = 'https://api.crossref.org/works';

export class CrossrefClient {
  static async searchPapers(query: string, limit = 20, offset = 0): Promise<APIResponse> {
    try {
      const params = new URLSearchParams({
        query: query,
        rows: limit.toString(),
        offset: offset.toString(),
        sort: 'relevance',
        order: 'desc'
      });

      const response = await fetch(`${BASE_URL}?${params}`, {
        headers: {
          'User-Agent': 'ResearchAssistant/1.0 (mailto:research@example.com)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`CrossRef API error: ${response.status}`);
      }

      const data = await response.json();
      
      const papers: Paper[] = data.message?.items?.map((item: any) => {
        const authors = item.author?.map((author: any) => 
          `${author.given || ''} ${author.family || ''}`.trim()
        ) || [];
        
        const year = item.published?.['date-parts']?.[0]?.[0] || 
                    item.created?.['date-parts']?.[0]?.[0] || 0;
        
        return {
          id: `crossref-${item.DOI}`,
          title: Array.isArray(item.title) ? item.title[0] : item.title || 'Untitled',
          authors,
          abstract: Array.isArray(item.abstract) ? item.abstract[0] : item.abstract || 'No abstract available',
          year,
          venue: item['container-title']?.[0] || item.publisher,
          citationCount: item['is-referenced-by-count'] || 0,
          url: item.URL,
          fields: item.subject || [],
          source: 'crossref' as const,
          doi: item.DOI
        };
      }) || [];

      return {
        papers,
        total: data.message?.['total-results'] || 0,
        hasMore: (data.message?.['total-results'] || 0) > offset + limit,
        nextOffset: offset + limit
      };
    } catch (error) {
      console.error('CrossRef API error:', error);
      return { papers: [], total: 0, hasMore: false };
    }
  }
}