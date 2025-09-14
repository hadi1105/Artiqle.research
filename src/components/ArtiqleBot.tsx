import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Search, BookOpen, Lightbulb, Key, ExternalLink, X, Send, Lock, Check } from 'lucide-react';
import { ArtiqleAIService } from '../services/artiqleAIService';

interface PaperSuggestion {
  title: string;
  searchQuery: string;
  description: string;
  keywords: string[];
  journal?: string;
  year?: number;
}

interface BotMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  paperSuggestions?: PaperSuggestion[];
  searchQueries?: string[];
  requiresApiKey?: boolean;
}

interface ArtiqleBotProps {
  onSuggestionClick?: (suggestion: string) => void;
  geminiApiKey?: string;
  onApiKeyChange?: (apiKey: string) => void;
}

const QUICK_SUGGESTIONS = [
  "Latest AI research trends",
  "Climate change solutions",
  "Quantum computing advances",
  "Biotechnology breakthroughs",
  "Renewable energy efficiency",
  "Space exploration technology"
];

export const ArtiqleBot: React.FC<ArtiqleBotProps> = ({ 
  onSuggestionClick,
  geminiApiKey,
  onApiKeyChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [apiKey, setApiKey] = useState(geminiApiKey || '');
  const [isValidatingApiKey, setIsValidatingApiKey] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const apiKeyInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (showApiKeyPrompt && apiKeyInputRef.current) {
      apiKeyInputRef.current.focus();
    }
  }, [showApiKeyPrompt]);

  const hasApiKey = ArtiqleAIService.hasApiKey() && apiKeyValid;

  const handleBotClick = () => {
    if (!hasApiKey) {
      setShowApiKeyPrompt(true);
    }
    setIsOpen(true);
  };

  const validateApiKey = async (key: string): Promise<{ valid: boolean; error?: string; workingModel?: string }> => {
    try {
      return await ArtiqleAIService.validateApiKey(key);
    } catch (error) {
      console.error('API key validation failed:', error);
      return { valid: false, error: 'Validation failed' };
    }
  };

  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) return;

    setIsValidatingApiKey(true);
    setApiKeyError(null);
    
    try {
      const validation = await validateApiKey(apiKey.trim());
      if (validation.valid) {
        setApiKeyValid(true);
        setShowApiKeyPrompt(false);
        setApiKeyError(null);
        ArtiqleAIService.setApiKey(apiKey.trim());
        if (onApiKeyChange) {
          onApiKeyChange(apiKey.trim());
        }
        
        // Initialize bot with welcome message
        const modelInfo = validation.workingModel ? ` (using ${validation.workingModel})` : '';
        const welcomeMessage: BotMessage = {
          id: '1',
          text: `Welcome! I'm Artiqle Bot, your AI research assistant. I'm now connected to Gemini AI${modelInfo} and ready to help you with intelligent research insights, paper recommendations, and optimized search strategies. What would you like to explore?`,
          isUser: false,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      } else {
        const errorMessage = validation.error || 'Invalid API key';
        setApiKeyError(`API key validation failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      setApiKeyError('Error validating API key. Please check your connection and try again.');
    } finally {
      setIsValidatingApiKey(false);
    }
  };

  const generateBotResponse = async (userMessage: string): Promise<BotMessage> => {
    const response = await ArtiqleAIService.generateResearchResponse(userMessage);
    
    return {
      id: (Date.now() + 1).toString(),
      text: response.text,
      isUser: false,
      timestamp: new Date(),
      paperSuggestions: response.paperSuggestions,
      searchQueries: response.searchQueries,
      requiresApiKey: response.requiresApiKey
    };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !hasApiKey) return;

    const userMessage: BotMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const botMessage = await generateBotResponse(inputText);
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating bot response:', error);
      const errorMessage: BotMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!hasApiKey) return;

    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
      setIsOpen(false);
    } else {
      setInputText(suggestion);
    }
  };

  const handlePaperSearch = (searchQuery: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(searchQuery);
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showApiKeyPrompt) {
        handleApiKeySubmit();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleApiKeyKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleApiKeySubmit();
    }
  };

  return (
    <>
      {/* AI Bot Toggle Button */}
      <button
        onClick={handleBotClick}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group ${
          hasApiKey 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
        }`}
        aria-label="Open Artiqle Bot"
      >
        <div className="relative">
          <Bot className="h-5 w-5" />
          {hasApiKey ? (
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300" />
          ) : (
            <Lock className="h-3 w-3 absolute -top-1 -right-1 text-white" />
          )}
        </div>
        <span className="font-medium">Artiqle Bot</span>
        <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-400 animate-pulse' : 'bg-white'}`}></div>
      </button>

      {/* Bot Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[700px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className={`text-white p-6 flex items-center justify-between ${
              hasApiKey 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
            }`}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Artiqle Bot</h3>
                  <p className="text-sm text-white/80 flex items-center">
                    {hasApiKey ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Connected to Gemini AI
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-1" />
                        API Key Required
                      </>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* API Key Prompt */}
            {showApiKeyPrompt && !hasApiKey && (
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Key className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">API Key Required</h4>
                  <p className="text-gray-600 mb-6">
                    To use Artiqle Bot, you need a Gemini API key. Get your free API key from Google AI Studio.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <input
                        ref={apiKeyInputRef}
                        type="password"
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setApiKeyError(null); // Clear error when user types
                        }}
                        onKeyPress={handleApiKeyKeyPress}
                        placeholder="Enter your Gemini API key"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                          apiKeyError 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        disabled={isValidatingApiKey}
                      />
                      {apiKeyError && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">{apiKeyError}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>Get your free API key:</strong>
                      </p>
                      <a 
                        href={ArtiqleAIService.getGoogleStudioUrl()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center justify-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Google AI Studio - Get API Key
                      </a>
                    </div>
                    
                    <button
                      onClick={handleApiKeySubmit}
                      disabled={!apiKey.trim() || isValidatingApiKey}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      {isValidatingApiKey ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Validating...
                        </div>
                      ) : (
                        'Connect to Gemini AI'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Suggestions - Only show if API key is available */}
            {hasApiKey && (
              <div className="p-4 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Quick Research Topics
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left p-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                    <div className={`rounded-2xl px-5 py-4 ${
                      message.isUser 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                    </div>
                    
                    {/* Paper Suggestions */}
                    {message.paperSuggestions && message.paperSuggestions.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Recommended Research Papers
                        </h4>
                        {message.paperSuggestions.map((paper, index) => (
                          <div key={index} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <h5 className="text-sm font-semibold text-blue-900 mb-2">{paper.title}</h5>
                            <p className="text-sm text-blue-700 mb-2">{paper.description}</p>
                            {paper.journal && (
                              <p className="text-xs text-blue-600 mb-2">
                                <strong>Journal:</strong> {paper.journal}
                              </p>
                            )}
                            <button
                              onClick={() => handlePaperSearch(paper.searchQuery)}
                              className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <Search className="h-4 w-4 mr-1" />
                              Search for this paper
                              <ExternalLink className="h-4 w-4 ml-1" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Search Queries */}
                    {message.searchQueries && message.searchQueries.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                          <Search className="h-4 w-4 mr-2" />
                          Optimized Search Queries
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {message.searchQueries.map((query, index) => (
                            <button
                              key={index}
                              onClick={() => handlePaperSearch(query)}
                              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
                            >
                              {query}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-5 py-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Only show if API key is available */}
            {hasApiKey && (
              <div className="p-6 border-t border-gray-100">
                <div className="flex space-x-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about research, papers, or trends..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isTyping}
                    className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};