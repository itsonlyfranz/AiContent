import { supabase } from './supabase';

interface TavilySearchResult {
  results: Array<{
    url: string;
    content: string;
  }>;
}

export interface GenerationParameters {
  tone?: string;
  length?: string;
  campaign?: string;
  targetAudience?: string;
}

export class AIService {
  private tavilyApiKey: string;

  constructor() {
    this.tavilyApiKey = import.meta.env.VITE_TAVILY_API_KEY;
  }

  private async searchContent(query: string): Promise<TavilySearchResult> {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.tavilyApiKey,
        query,
        search_depth: "basic",
        include_answer: true,
        topic: "news",
        include_raw_content: true,
        max_results: 3
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }

    return response.json();
  }

  private async generateWithClaude(prompt: string, systemMessage: string): Promise<string> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: prompt
          }],
          system: systemMessage
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to generate content with Claude: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Claude API Response:', data);

      if (!data.content?.[0]?.text) {
        console.error('Unexpected Claude API response format:', data);
        throw new Error('Invalid response format from Claude API');
      }

      return data.content[0].text;
    } catch (error) {
      console.error('Error in generateWithClaude:', error);
      throw error;
    }
  }

  async generateContent(
    input: string,
    parameters: {
      tone: string;
      length: string;
      campaign: string;
      targetAudience: string;
    },
    platform: string
  ): Promise<string> {
    try {
      console.log('Generating content with:', { input, parameters, platform });
      
      // 1. Search for relevant content
      const searchResults = await this.searchContent(input);
      const aggregatedData = searchResults.results.map(r => r.content).join('\n\n');

      // 2. Generate content based on platform
      const systemMessage = `You are a professional content writer. 
        Create a ${platform} post about ${input}.
        Tone: ${parameters.tone || 'professional'}
        Length: ${parameters.length || 'medium'}
        Target Audience: ${parameters.targetAudience}
        Use the following reference content: ${aggregatedData}`;

      const generatedContent = await this.generateWithClaude(
        `Please write a ${platform} post about: ${input}`,
        systemMessage
      );

      // 3. Save to campaign if campaign name is provided
      if (parameters.campaign) {
        const { error } = await supabase
          .from('campaigns')
          .insert({
            campaign: parameters.campaign,
            content: generatedContent,
            platform: platform,
            status: 'completed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error saving campaign:', error);
        }
      }

      return generatedContent;
    } catch (error) {
      console.error('Error in generateContent:', error);
      throw error;
    }
  }
}

const LINKEDIN_SYSTEM_MESSAGE = `# System Role  
You are an expert LinkedIn content creator specializing in transforming incoming articles into highly engaging posts tailored to a specific target audience.  

# Task Specification  
Using the provided article, craft a LinkedIn post that is:  
1. Written in a concise, engaging tone optimized for readability on mobile.  
2. Tailored specifically to the target audience's interests, needs, and professional goals.  
3. Plain text only, with frequent line breaks for clarity.  
4. Incorporates 1-2 emojis to enhance personality and appeal.  
5. Provides actionable value and includes a clear call to action.  
6. Contains 3-5 relevant hashtags.  
7. Outputs only the post text—nothing else.`;

const TWITTER_SYSTEM_MESSAGE = `# System Role  
You are an expert Twitter content creator specializing in transforming articles into engaging, concise tweets tailored to a specific target audience.  

# Task Specification  
Using the provided article, craft a tweet that is:  
1. Short, concise, and optimized for Twitter's character limit (280 characters).  
2. Tailored to resonate with the target audience's interests, needs, and goals.  
3. Incorporates 1-2 emojis to enhance personality and appeal.  
4. Offers value or insight and includes a clear call to action.  
5. Contains 1-3 relevant hashtags.  
6. Outputs only the tweet text—nothing else.`;

const BLOG_SYSTEM_MESSAGE = `# System Role
You are a skilled and creative blog writer, capable of crafting engaging, concise, and well-structured two-paragraph blog articles based on provided content.

# Task Specification
Write a two-paragraph blog article using the provided content. The blog should be coherent, engaging, and informative, tailored to a general audience. Ensure the tone is professional yet approachable, and the structure flows logically from introduction to conclusion.`; 