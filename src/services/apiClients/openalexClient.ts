import { Paper, APIResponse } from '../../types/paper';

const BASE_URL = 'https://api.openalex.org/works';

export class OpenAlexClient {
  static async searchPapers(query: string, limit = 20, offset = 0): Promise<APIResponse> {
    try {
      const params = new URLSearchParams({
        search: query,
        per_page: limit.toString(),
        page: Math.floor(offset / limit) + 1 + '',
        sort: 'relevance_score:desc'
      });

      const response = await fetch(`${BASE_URL}?${params}`, {
        headers: {
          'User-Agent': 'ResearchAssistant/1.0 (mailto:research@example.com)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`OpenAlex API error: ${response.status}`);
      }

      const data = await response.json();
      
      const papers: Paper[] = data.results?.map((work: any) => {
        const authors = work.authorships?.map((authorship: any) => 
          authorship.author?.display_name
        ).filter(Boolean) || [];
        
        const concepts = work.concepts?.map((concept: any) => concept.display_name) || [];
        
        return {
          id: `openalex-${work.id?.split('/').pop()}`,
          title: work.title || 'Untitled',
          authors,
          abstract: work.abstract || 'No abstract available',
          year: work.publication_year || 0,
          venue: work.primary_location?.source?.display_name,
          citationCount: work.cited_by_count || 0,
          url: work.primary_location?.landing_page_url,
          pdfUrl: work.open_access?.oa_url,
          fields: concepts,
          source: 'openalex' as const,
          openAlexId: work.id,
          doi: work.doi?.replace('https://doi.org/', '')
        };
      }) || [];

      return {
        papers,
        total: data.meta?.count || 0,
        hasMore: (data.meta?.count || 0) > offset + limit,
        nextOffset: offset + limit
      };
    } catch (error) {
      console.error('OpenAlex API error:', error);
      return { papers: [], total: 0, hasMore: false };
    }
  }
}