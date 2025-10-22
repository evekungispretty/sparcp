import OpenAI from 'openai';
import { getSystemPromptByScenarioId } from './prompts';

// Initialize OpenAI client with UF Navigator configuration
const client = new OpenAI({
  apiKey: import.meta.env.VITE_NAVIGATOR_API_KEY,
  baseURL: import.meta.env.VITE_NAVIGATOR_BASE_URL,
  // Running in the browser: UF Navigator usage requires exposing a key to the client.
  // Ensure you understand the risks and have appropriate mitigations.
  dangerouslyAllowBrowser: true,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string;
  error?: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  model: string;
  baseUrl: string;
  lastChecked: Date;
  error?: string;
}

/**
 * Send a chat message to the LiteLLM proxy and get AI response
 * @param conversationHistory - Array of previous messages in the conversation
 * @param userMessage - The current user message
 * @param scenarioId - The scenario ID to determine which system prompt to use
 * @returns Promise with AI response content
 */
export async function sendChatMessage(
  conversationHistory: ChatMessage[],
  userMessage: string,
  scenarioId: string
): Promise<ChatResponse> {
  try {
    // Get the appropriate system prompt based on scenario
    const systemPrompt = getSystemPromptByScenarioId(scenarioId);
    
    // Build the complete message array with system prompt
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ];

    // Make API call to LiteLLM proxy
    const response = await client.chat.completions.create({
      model: import.meta.env.VITE_MODEL_NAME || 'gpt-oss-120b',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = response.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response received from AI');
    }

    return {
      content: aiResponse
    };

  } catch (error) {
    console.error('Error calling LiteLLM API:', error);
    
    let errorMessage = "I'm sorry, I'm having trouble responding right now. Please try again.";
    
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        errorMessage = "Authentication error. Please check your API key in the .env file.";
      } else if (error.message.includes('database server')) {
        errorMessage = "Database connection error. The UF Navigator service may be temporarily unavailable.";
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your internet connection.";
      }
    }
    
    return {
      content: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Check connection status to UF Navigator
 */
export async function checkConnectionStatus(): Promise<ConnectionStatus> {
  const baseUrl = import.meta.env.VITE_NAVIGATOR_BASE_URL;
  const model = import.meta.env.VITE_MODEL_NAME || 'gpt-oss-120b';
  
  try {
    // Test connection with a simple request
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'user',
          content: 'Hello'
        }
      ],
      max_tokens: 5
    });
    
    return {
      isConnected: true,
      model: model,
      baseUrl: baseUrl,
      lastChecked: new Date()
    };
  } catch (error) {
    return {
      isConnected: false,
      model: model,
      baseUrl: baseUrl,
      lastChecked: new Date(),
      error: error instanceof Error ? error.message : 'Connection failed'
    };
  }
}

/**
 * Convert AvatarChat messages to OpenAI format
 */
export function convertToOpenAIFormat(messages: Array<{sender: string, content: string}>): ChatMessage[] {
  return messages
    .filter(msg => msg.sender !== 'avatar') // Filter out avatar messages to avoid duplication
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));
}
