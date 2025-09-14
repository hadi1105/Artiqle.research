import { Paper, APIResponse } from '../../types/paper';

const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export class PubmedClient {
  static async searchPapers(query: string, limit = 20, offset = 0): Promise<APIResponse> {
    try {
      // Enhance query for better PubMed results
      const enhancedQuery = this.enhanceQueryForPubMed(query);
      
      // First, search for PMIDs
      const searchParams = new URLSearchParams({
        db: 'pubmed',
        term: enhancedQuery,
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

  private static enhanceQueryForPubMed(query: string): string {
    // Add MeSH terms and synonyms for better PubMed results
    const medicalTerms: { [key: string]: string[] } = {
      'cancer': ['neoplasms', 'tumors', 'carcinoma'],
      'heart disease': ['cardiovascular diseases', 'heart failure', 'myocardial infarction'],
      'diabetes': ['diabetes mellitus', 'diabetic', 'glucose'],
      'depression': ['depressive disorder', 'mental health', 'mood disorders'],
      'covid': ['COVID-19', 'SARS-CoV-2', 'coronavirus'],
      'alzheimer': ['Alzheimer disease', 'dementia', 'cognitive impairment'],
      'hypertension': ['high blood pressure', 'blood pressure'],
      'obesity': ['overweight', 'body mass index', 'BMI'],
      'stroke': ['cerebrovascular accident', 'brain attack'],
      'asthma': ['respiratory diseases', 'bronchial asthma']
    };

    let enhancedQuery = query;
    const lowerQuery = query.toLowerCase();
    
    for (const [term, synonyms] of Object.entries(medicalTerms)) {
      if (lowerQuery.includes(term)) {
        enhancedQuery += ` OR ${synonyms.join(' OR ')}`;
      }
    }

    return enhancedQuery;
  }
}