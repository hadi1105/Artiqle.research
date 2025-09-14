interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface PaperSuggestion {
  title: string;
  searchQuery: string;
  description: string;
  keywords: string[];
  journal?: string;
  year?: number;
}

interface AIResponse {
  text: string;
  paperSuggestions: PaperSuggestion[];
  searchQueries: string[];
  requiresApiKey: boolean;
}

// Available research sources in our engine
const RESEARCH_SOURCES = [
  'Semantic Scholar', 'arXiv', 'CrossRef', 'PubMed', 'OpenAlex', 'CORE',
  'bioRxiv', 'medRxiv', 'chemRxiv', 'SSRN', 'IEEE Xplore', 'ACM Digital Library',
  'SpringerLink', 'Wiley Online Library', 'ScienceDirect', 'JSTOR', 'SAGE Journals',
  'Taylor & Francis', 'Oxford Academic', 'Cambridge Core', 'DOAJ', 'GOV.INFO',
  'ERIC', 'AGRIS', 'RePEc', 'DBLP'
];

// Research fields we support
const RESEARCH_FIELDS = [
  'Machine Learning', 'Natural Language Processing', 'Computer Vision', 'Artificial Intelligence',
  'Data Science', 'Robotics', 'Human-Computer Interaction', 'Software Engineering',
  'Medicine', 'Clinical Medicine', 'Public Health', 'Epidemiology', 'Pharmacology',
  'Neuroscience', 'Cardiology', 'Oncology', 'Immunology', 'Genetics', 'Molecular Biology',
  'Biochemistry', 'Physics', 'Chemistry', 'Mathematics', 'Statistics', 'Astronomy',
  'Geology', 'Environmental Science', 'Materials Science', 'Engineering', 'Psychology',
  'Sociology', 'Economics', 'Political Science', 'Anthropology', 'Education', 'Linguistics',
  'Philosophy', 'Biology', 'Ecology', 'Botany', 'Zoology', 'Microbiology', 'Biotechnology'
];

export class ArtiqleAIService {
  private static apiKey: string | null = null;
  private static baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
  private static availableModels = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.0-pro',
    'gemini-pro'
  ];

  static setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  static hasApiKey(): boolean {
    return !!this.apiKey;
  }

  static async validateApiKey(apiKey: string): Promise<{ valid: boolean; error?: string; workingModel?: string }> {
    console.log('Validating API key...');
    
    // Try each available model
    for (const model of this.availableModels) {
      try {
        console.log(`Trying model: ${model}`);
        const modelUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        
        const response = await fetch(`${modelUrl}?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Hello"
              }]
            }],
            generationConfig: {
              maxOutputTokens: 10
            }
          })
        });

        console.log(`Model ${model} - API response status:`, response.status);
        console.log(`Model ${model} - API response ok:`, response.ok);

        if (response.ok) {
          console.log(`API key validation successful with model: ${model}`);
          // Update the base URL to use the working model
          this.baseUrl = modelUrl;
          return { valid: true, workingModel: model };
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.log(`Model ${model} - API error data:`, errorData);
          
          // If this is the last model, return the error
          if (model === this.availableModels[this.availableModels.length - 1]) {
            const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
            return { valid: false, error: errorMessage };
          }
        }
      } catch (error) {
        console.error(`Model ${model} - API key validation error:`, error);
        
        // If this is the last model, return the error
        if (model === this.availableModels[this.availableModels.length - 1]) {
          return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
        }
      }
    }
    
    return { valid: false, error: 'No working model found' };
  }

  static async generateResearchResponse(query: string): Promise<AIResponse> {
    if (!this.apiKey) {
      return {
        text: "Artiqle Bot requires a Gemini API key to provide intelligent research assistance. Please add your API key to unlock AI-powered recommendations and insights.",
        paperSuggestions: [],
        searchQueries: [],
        requiresApiKey: true
      };
    }

    try {
      const prompt = `You are Artiqle Bot, an expert AI research assistant integrated with a comprehensive academic search engine. You have access to the following research sources and fields:

RESEARCH SOURCES: ${RESEARCH_SOURCES.join(', ')}

RESEARCH FIELDS: ${RESEARCH_FIELDS.join(', ')}

User Query: "${query}"

Please provide a comprehensive, research-focused response that:
1. Directly addresses the question with scientific accuracy
2. Provides specific, detailed information based on current research
3. Suggests relevant research directions and methodologies
4. Mentions specific journals, authors, or papers when relevant
5. Uses proper scientific terminology
6. Suggests 3-5 optimized search queries for our research engine
7. Recommends 2-3 specific paper topics with journal references

Format your response as:
RESPONSE: [Your detailed response here]

SEARCH_QUERIES:
- [Query 1]
- [Query 2]
- [Query 3]

PAPER_SUGGESTIONS:
- [Paper topic 1]: [Brief description] | Journal: [Relevant journal]
- [Paper topic 2]: [Brief description] | Journal: [Relevant journal]
- [Paper topic 3]: [Brief description] | Journal: [Relevant journal]

Focus on being helpful for academic research and scientific work. Reference specific journals from our available sources when possible.`;

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || '';
      
      return this.parseAIResponse(aiResponse, query);
    } catch (error) {
      console.error('AI API Error:', error);
      return {
        text: "I apologize, but I'm experiencing technical difficulties. Please check your API key and try again. If the problem persists, please verify your Gemini API key is valid and has sufficient quota.",
        paperSuggestions: [],
        searchQueries: [],
        requiresApiKey: false
      };
    }
  }

  private static parseAIResponse(response: string, _originalQuery: string): AIResponse {
    try {
      const responseMatch = response.match(/RESPONSE:\s*([\s\S]*?)(?=SEARCH_QUERIES:|$)/);
      const searchQueriesMatch = response.match(/SEARCH_QUERIES:\s*([\s\S]*?)(?=PAPER_SUGGESTIONS:|$)/);
      const paperSuggestionsMatch = response.match(/PAPER_SUGGESTIONS:\s*([\s\S]*?)$/);

      const text = responseMatch ? responseMatch[1].trim() : response;
      const searchQueries = searchQueriesMatch ? 
        searchQueriesMatch[1].split('\n').map(q => q.replace(/^-\s*/, '').trim()).filter(q => q) : [];
      const paperSuggestions = paperSuggestionsMatch ? 
        this.parsePaperSuggestions(paperSuggestionsMatch[1]) : [];

      return { 
        text, 
        paperSuggestions, 
        searchQueries, 
        requiresApiKey: false 
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        text: response || "I was unable to process your request. Please try rephrasing your question.",
        paperSuggestions: [],
        searchQueries: [],
        requiresApiKey: false
      };
    }
  }

  private static parsePaperSuggestions(suggestionsText: string): PaperSuggestion[] {
    const lines = suggestionsText.split('\n').map(line => line.replace(/^-\s*/, '').trim()).filter(line => line);
    
    return lines.map((line, index) => {
      const [titlePart, descriptionPart] = line.split(':').map(s => s.trim());
      const [description, journalPart] = descriptionPart ? descriptionPart.split('|').map(s => s.trim()) : ['', ''];
      const journal = journalPart ? journalPart.replace('Journal:', '').trim() : '';
      
      return {
        title: titlePart || `Research Paper ${index + 1}`,
        searchQuery: titlePart || line,
        description: description || 'Relevant research paper',
        keywords: this.extractKeywords(titlePart + ' ' + description),
        journal: journal || undefined,
        year: new Date().getFullYear()
      };
    });
  }

  private static extractKeywords(text: string): string[] {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 5);
  }

  static getApiKeyInstructions(): string {
    return "To use Artiqle Bot, you need a Gemini API key. Get your free API key from Google AI Studio and paste it in the settings below.";
  }

  static getGoogleStudioUrl(): string {
    return "https://makersuite.google.com/app/apikey";
  }
}
