import { Paper, APIResponse } from '../../types/paper';

const BASE_URL = 'https://api.core.ac.uk/v3/search/works';

export class CoreClient {
  static async searchPapers(query: string, limit = 20, offset = 0): Promise<APIResponse> {
    try {
      const requestBody = {
        q: query,
        limit,
        offset,
        sort: 'relevance'
      };

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_CORE_API_KEY' // Note: CORE requires API key
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        // If API key is missing or invalid, return empty results
        if (response.status === 401 || response.status === 403) {
          console.warn('CORE API key required for access');
          return { papers: [], total: 0, hasMore: false };
        }
        throw new Error(`CORE API error: ${response.status}`);
      }

      const data = await response.json();
      
      const papers: Paper[] = data.results?.map((work: { id: string; title?: string; authors?: Array<{ name: string }>; abstract?: string; description?: string; yearPublished?: number; journals?: Array<{ title: string }>; publisher?: string; downloadUrl?: string; urls?: string[]; subjects?: string[]; doi?: string }) => {
        const authors = work.authors?.map((author: { name: string }) => author.name) || [];
        
        return {
          id: `core-${work.id}`,
          title: work.title || 'Untitled',
          authors,
          abstract: work.abstract || work.description || 'No abstract available',
          year: work.yearPublished || 0,
          venue: work.journals?.[0]?.title || work.publisher,
          citationCount: 0, // CORE doesn't provide citation counts in basic search
          url: work.downloadUrl || work.urls?.[0],
          pdfUrl: work.downloadUrl,
          fields: work.subjects || [],
          source: 'core' as const,
          coreId: work.id,
          doi: work.doi
        };
      }) || [];

      return {
        papers,
        total: data.totalHits || 0,
        hasMore: (data.totalHits || 0) > offset + limit,
        nextOffset: offset + limit
      };
    } catch (error) {
      console.error('CORE API error:', error);
      return { papers: [], total: 0, hasMore: false };
    }
  }
}