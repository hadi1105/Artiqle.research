import { Paper, APIResponse } from '../../types/paper';

const BASE_URL = 'https://export.arxiv.org/api/query';

export class ArxivClient {
  static async searchPapers(query: string, limit = 20, offset = 0): Promise<APIResponse> {
    try {
      const params = new URLSearchParams({
        search_query: `all:${query}`,
        start: offset.toString(),
        max_results: limit.toString(),
        sortBy: 'relevance',
        sortOrder: 'descending'
      });

      const response = await fetch(`${BASE_URL}?${params}`);
      
      if (!response.ok) {
        throw new Error(`ArXiv API error: ${response.status}`);
      }

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const entries = xmlDoc.querySelectorAll('entry');
      const totalResults = parseInt(xmlDoc.querySelector('opensearch\\:totalResults, totalResults')?.textContent || '0');
      
      const papers: Paper[] = Array.from(entries).map(entry => {
        const id = entry.querySelector('id')?.textContent?.split('/').pop() || '';
        const title = entry.querySelector('title')?.textContent?.trim() || 'Untitled';
        const summary = entry.querySelector('summary')?.textContent?.trim() || 'No abstract available';
        const published = entry.querySelector('published')?.textContent;
        const year = published ? new Date(published).getFullYear() : 0;
        
        const authors = Array.from(entry.querySelectorAll('author name')).map(
          author => author.textContent?.trim() || ''
        );
        
        const categories = Array.from(entry.querySelectorAll('category')).map(
          cat => cat.getAttribute('term') || ''
        );
        
        const pdfLink = Array.from(entry.querySelectorAll('link')).find(
          link => link.getAttribute('type') === 'application/pdf'
        );
        
        return {
          id: `arxiv-${id}`,
          title,
          authors,
          abstract: summary,
          year,
          venue: 'arXiv',
          citationCount: 0, // ArXiv doesn't provide citation counts
          url: entry.querySelector('id')?.textContent || '',
          pdfUrl: pdfLink?.getAttribute('href') || '',
          fields: categories,
          source: 'arxiv' as const,
          arxivId: id
        };
      });

      return {
        papers,
        total: totalResults,
        hasMore: totalResults > offset + limit,
        nextOffset: offset + limit
      };
    } catch (error) {
      console.error('ArXiv API error:', error);
      return { papers: [], total: 0, hasMore: false };
    }
  }
}