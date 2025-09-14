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
}

interface EnhancedResponse {
  text: string;
  paperSuggestions: PaperSuggestion[];
  searchQueries: string[];
  needsApiKey?: boolean;
}

export class EnhancedAIService {
  private static apiKey: string | null = null;
  private static baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  static setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  static async generateResearchResponse(query: string): Promise<EnhancedResponse> {
    if (!this.apiKey) {
      // Enhanced fallback that acts as a smart search engine
      return this.getSmartSearchResponse(query);
    }

    try {
      const prompt = `You are an expert research assistant specializing in academic research across all fields. 

User Query: "${query}"

Please provide a comprehensive, research-focused response that:
1. Directly addresses the question with scientific accuracy
2. Provides specific, detailed information
3. Suggests relevant research directions and methodologies
4. Mentions key papers, authors, or journals when relevant
5. Uses proper scientific terminology
6. Suggests 3-5 specific search queries for finding relevant papers
7. Recommends 2-3 specific paper topics to search for

Format your response as:
RESPONSE: [Your detailed response here]

SEARCH_QUERIES:
- [Query 1]
- [Query 2]
- [Query 3]

PAPER_SUGGESTIONS:
- [Paper topic 1]: [Brief description]
- [Paper topic 2]: [Brief description]
- [Paper topic 3]: [Brief description]

Focus on being helpful for academic research and scientific work.`;

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
      return this.getSmartSearchResponse(query);
    }
  }

  private static parseAIResponse(response: string, originalQuery: string): EnhancedResponse {
    try {
      const responseMatch = response.match(/RESPONSE:\s*([\s\S]*?)(?=SEARCH_QUERIES:|$)/);
      const searchQueriesMatch = response.match(/SEARCH_QUERIES:\s*([\s\S]*?)(?=PAPER_SUGGESTIONS:|$)/);
      const paperSuggestionsMatch = response.match(/PAPER_SUGGESTIONS:\s*([\s\S]*?)$/);

      const text = responseMatch ? responseMatch[1].trim() : response;
      const searchQueries = searchQueriesMatch ? 
        searchQueriesMatch[1].split('\n').map(q => q.replace(/^-\s*/, '').trim()).filter(q => q) : [];
      const paperSuggestions = paperSuggestionsMatch ? 
        this.parsePaperSuggestions(paperSuggestionsMatch[1]) : [];

      return { text, paperSuggestions, searchQueries };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getSmartSearchResponse(originalQuery);
    }
  }

  private static parsePaperSuggestions(suggestionsText: string): PaperSuggestion[] {
    const lines = suggestionsText.split('\n').map(line => line.replace(/^-\s*/, '').trim()).filter(line => line);
    
    return lines.map((line, index) => {
      const [title, description] = line.split(':').map(s => s.trim());
      return {
        title: title || `Paper ${index + 1}`,
        searchQuery: title || line,
        description: description || 'Relevant research paper',
        keywords: this.extractKeywords(title + ' ' + description)
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

  private static getSmartSearchResponse(query: string): EnhancedResponse {
    const lowerQuery = query.toLowerCase();
    
    // Analyze the query and provide intelligent search-focused responses
    const { domain, searchQueries, paperSuggestions } = this.analyzeQuery(query);
    
    let response = `I can help you find research on "${query}". `;
    
    if (domain) {
      response += `This appears to be related to ${domain}. `;
    }
    
    response += `Here are some targeted search strategies and paper suggestions to help you find relevant research:`;
    
    // Add API key encouragement
    const needsApiKey = true;
    
    return {
      text: response,
      paperSuggestions,
      searchQueries,
      needsApiKey
    };
  }

  private static analyzeQuery(query: string): { domain: string | null, searchQueries: string[], paperSuggestions: PaperSuggestion[] } {
    const lowerQuery = query.toLowerCase();
    
    // AI & Machine Learning
    if (lowerQuery.includes('ai') || lowerQuery.includes('artificial intelligence') || 
        lowerQuery.includes('machine learning') || lowerQuery.includes('neural network') ||
        lowerQuery.includes('deep learning') || lowerQuery.includes('algorithm')) {
      return {
        domain: 'Artificial Intelligence & Machine Learning',
        searchQueries: [
          `${query} machine learning applications`,
          `${query} artificial intelligence research`,
          `${query} neural networks deep learning`,
          `${query} AI algorithms 2024`,
          `${query} computer vision natural language processing`
        ],
        paperSuggestions: [
          {
            title: "Recent Advances in AI",
            searchQuery: `${query} recent advances artificial intelligence`,
            description: "Latest developments and breakthroughs in AI research",
            keywords: ["AI", "artificial", "intelligence", "recent", "advances"]
          },
          {
            title: "Machine Learning Applications",
            searchQuery: `${query} machine learning applications`,
            description: "Practical applications of machine learning in various domains",
            keywords: ["machine", "learning", "applications", "practical"]
          }
        ]
      };
    }

    // Medicine & Health
    if (lowerQuery.includes('medicine') || lowerQuery.includes('medical') || 
        lowerQuery.includes('health') || lowerQuery.includes('disease') ||
        lowerQuery.includes('treatment') || lowerQuery.includes('drug') ||
        lowerQuery.includes('clinical') || lowerQuery.includes('patient')) {
      return {
        domain: 'Medicine & Health Sciences',
        searchQueries: [
          `${query} clinical trials`,
          `${query} medical research`,
          `${query} treatment outcomes`,
          `${query} healthcare applications`,
          `${query} biomedical research`
        ],
        paperSuggestions: [
          {
            title: "Clinical Research Studies",
            searchQuery: `${query} clinical studies research`,
            description: "Clinical trials and medical research studies",
            keywords: ["clinical", "studies", "research", "medical"]
          },
          {
            title: "Treatment and Therapy",
            searchQuery: `${query} treatment therapy medical`,
            description: "Medical treatments and therapeutic approaches",
            keywords: ["treatment", "therapy", "medical", "therapeutic"]
          }
        ]
      };
    }

    // Chemistry & Materials
    if (lowerQuery.includes('chemical') || lowerQuery.includes('chemistry') || 
        lowerQuery.includes('material') || lowerQuery.includes('polymer') ||
        lowerQuery.includes('synthesis') || lowerQuery.includes('molecule') ||
        lowerQuery.includes('solvent') || lowerQuery.includes('reaction')) {
      return {
        domain: 'Chemistry & Materials Science',
        searchQueries: [
          `${query} chemical synthesis`,
          `${query} materials science`,
          `${query} polymer chemistry`,
          `${query} molecular research`,
          `${query} green chemistry`
        ],
        paperSuggestions: [
          {
            title: "Chemical Synthesis Methods",
            searchQuery: `${query} synthesis methods chemistry`,
            description: "Chemical synthesis and reaction methodologies",
            keywords: ["synthesis", "methods", "chemistry", "reaction"]
          },
          {
            title: "Materials Characterization",
            searchQuery: `${query} materials characterization`,
            description: "Materials properties and characterization techniques",
            keywords: ["materials", "characterization", "properties", "techniques"]
          }
        ]
      };
    }

    // Physics & Engineering
    if (lowerQuery.includes('physics') || lowerQuery.includes('engineering') || 
        lowerQuery.includes('energy') || lowerQuery.includes('mechanical') ||
        lowerQuery.includes('electrical') || lowerQuery.includes('quantum') ||
        lowerQuery.includes('nanotechnology') || lowerQuery.includes('solar')) {
      return {
        domain: 'Physics & Engineering',
        searchQueries: [
          `${query} engineering applications`,
          `${query} physics research`,
          `${query} energy systems`,
          `${query} nanotechnology`,
          `${query} quantum physics`
        ],
        paperSuggestions: [
          {
            title: "Engineering Applications",
            searchQuery: `${query} engineering applications`,
            description: "Engineering solutions and technological applications",
            keywords: ["engineering", "applications", "technology", "solutions"]
          },
          {
            title: "Physics Research",
            searchQuery: `${query} physics research`,
            description: "Fundamental physics research and discoveries",
            keywords: ["physics", "research", "fundamental", "discoveries"]
          }
        ]
      };
    }

    // Biology & Life Sciences
    if (lowerQuery.includes('biology') || lowerQuery.includes('biological') || 
        lowerQuery.includes('cell') || lowerQuery.includes('gene') ||
        lowerQuery.includes('protein') || lowerQuery.includes('dna') ||
        lowerQuery.includes('evolution') || lowerQuery.includes('ecosystem')) {
      return {
        domain: 'Biology & Life Sciences',
        searchQueries: [
          `${query} biological research`,
          `${query} molecular biology`,
          `${query} genetics genomics`,
          `${query} cell biology`,
          `${query} evolutionary biology`
        ],
        paperSuggestions: [
          {
            title: "Molecular Biology Research",
            searchQuery: `${query} molecular biology`,
            description: "Molecular mechanisms and cellular processes",
            keywords: ["molecular", "biology", "cellular", "mechanisms"]
          },
          {
            title: "Genetics and Genomics",
            searchQuery: `${query} genetics genomics`,
            description: "Genetic research and genomic studies",
            keywords: ["genetics", "genomics", "genetic", "genomic"]
          }
        ]
      };
    }

    // Environmental & Climate
    if (lowerQuery.includes('climate') || lowerQuery.includes('environment') || 
        lowerQuery.includes('sustainability') || lowerQuery.includes('renewable') ||
        lowerQuery.includes('carbon') || lowerQuery.includes('pollution') ||
        lowerQuery.includes('green') || lowerQuery.includes('sustainable')) {
      return {
        domain: 'Environmental Science & Sustainability',
        searchQueries: [
          `${query} climate change`,
          `${query} environmental impact`,
          `${query} sustainability research`,
          `${query} renewable energy`,
          `${query} carbon reduction`
        ],
        paperSuggestions: [
          {
            title: "Climate Change Research",
            searchQuery: `${query} climate change research`,
            description: "Climate science and environmental impact studies",
            keywords: ["climate", "change", "environmental", "impact"]
          },
          {
            title: "Sustainable Solutions",
            searchQuery: `${query} sustainable solutions`,
            description: "Sustainable technologies and green solutions",
            keywords: ["sustainable", "solutions", "green", "technologies"]
          }
        ]
      };
    }

    // Default - General Research
    return {
      domain: null,
      searchQueries: [
        `${query} research studies`,
        `${query} academic papers`,
        `${query} scientific literature`,
        `${query} recent research`,
        `${query} research methodology`
      ],
      paperSuggestions: [
        {
          title: "Research Studies",
          searchQuery: `${query} research studies`,
          description: "Academic research studies and scientific investigations",
          keywords: ["research", "studies", "academic", "scientific"]
        },
        {
          title: "Literature Review",
          searchQuery: `${query} literature review`,
          description: "Comprehensive literature reviews and meta-analyses",
          keywords: ["literature", "review", "meta-analysis", "comprehensive"]
        }
      ]
    };
  }
}
