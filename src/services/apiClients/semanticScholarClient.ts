import { Paper, APIResponse } from '../../types/paper';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

export class SemanticScholarClient {
  static async searchPapers(query: string, limit = 20, offset = 0): Promise<APIResponse> {
    try {
      // Clean and optimize query
      const cleanQuery = query.trim().replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ');
      
      const params = new URLSearchParams({
        query: cleanQuery,
        limit: Math.min(limit, 100).toString(), // API has max limit of 100
        offset: offset.toString(),
        fields: 'paperId,title,authors,abstract,year,venue,citationCount,url,openAccessPdf,fieldsOfStudy,externalIds'
      });

      const response = await fetch(`${BASE_URL}/paper/search?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ResearchAssistant/1.0'
        }
      });
      
      if (!response.ok) {
        console.error(`Semantic Scholar API error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        
        // Try with a simpler query if the original failed
        if (query !== cleanQuery) {
          console.log('Retrying with simplified query...');
          return this.searchPapers(cleanQuery, limit, offset);
        }
        
        // Return empty results instead of throwing to allow other APIs to work
        return { papers: [], total: 0, hasMore: false };
      }

      const data = await response.json();
      console.log('Semantic Scholar API response:', data);
      
      if (!data || !data.data) {
        console.warn('Semantic Scholar API returned no data');
        return { papers: [], total: 0, hasMore: false };
      }

      const papers: Paper[] = data.data.map((paper: any) => {
        // Handle authors safely
        const authors = paper.authors?.map((author: any) => {
          if (typeof author === 'string') return author;
          return author.name || author.displayName || 'Unknown Author';
        }).filter(Boolean) || [];

        // Handle fields of study
        const fields = paper.fieldsOfStudy?.filter(Boolean) || [];

        // Get DOI from external IDs
        const doi = paper.externalIds?.DOI || paper.doi;

        return {
          id: `ss-${paper.paperId}`,
          title: paper.title || 'Untitled',
          authors,
          abstract: paper.abstract || 'No abstract available',
          year: paper.year || 0,
          venue: paper.venue || 'Unknown Venue',
          citationCount: paper.citationCount || 0,
          url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
          pdfUrl: paper.openAccessPdf?.url,
          fields,
          source: 'semantic-scholar' as const,
          doi
        };
      });

      return {
        papers,
        total: data.total || papers.length,
        hasMore: (data.total || 0) > offset + limit,
        nextOffset: offset + limit
      };
    } catch (error) {
      console.error('Semantic Scholar API error:', error);
      // Return empty results instead of throwing to allow other APIs to work
      return { papers: [], total: 0, hasMore: false };
    }
  }
}