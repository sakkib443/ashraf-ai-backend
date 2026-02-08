import { getGroqInstance, groqConfig } from '../config/groq';
import { Conversation, IConversationDoc, IMessageDoc } from '../models';
import { isDatabaseConnected } from '../config/database';
import { isImageRequest, extractImagePrompt, generateImage, formatImageResponse } from './image.service';

interface MessageHistory {
    role: 'user' | 'model';
    content: string;
    timestamp: Date;
}

// In-memory storage for stateless mode
const memoryStore: Map<string, { title: string; messages: MessageHistory[] }> = new Map();

// System prompt for Extrain Ai
const SYSTEM_PROMPT = `You are Extrain Ai, an advanced AI assistant created to help users with various tasks. You are:
- Friendly, helpful, and professional
- Knowledgeable about coding, writing, analysis, and general topics
- Able to provide clear and concise answers
- Supportive and encouraging

Always respond in a helpful manner. If asked about your identity, you are "Extrain Ai" - a next-generation AI assistant.
You can respond in both English and Bengali (Bangla) based on the user's language preference.

IMPORTANT: You have image generation capabilities! If a user asks you to create, generate, draw, or make an image/picture, 
acknowledge that you'll generate it for them. The system will handle the actual image generation.`;

export class ChatService {
    /**
     * Generate AI response using Groq (Llama 3.3 70B)
     * Also handles image generation requests
     */
    async generateResponse(
        message: string,
        conversationHistory: MessageHistory[] = []
    ): Promise<string> {
        // Check if this is an image generation request
        if (isImageRequest(message)) {
            console.log('🖼️ Image generation request detected!');

            const prompt = extractImagePrompt(message);
            const result = await generateImage(prompt);

            return formatImageResponse(result);
        }

        // Regular text response via Groq
        try {
            const groq = getGroqInstance();

            // Build messages array for Groq
            const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
                { role: 'system', content: SYSTEM_PROMPT }
            ];

            // Add conversation history
            for (const msg of conversationHistory) {
                messages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                });
            }

            // Add current message
            messages.push({ role: 'user', content: message });

            console.log(`🤖 Sending request to Groq (${groqConfig.model})...`);

            // Call Groq API
            const completion = await groq.chat.completions.create({
                model: groqConfig.model,
                messages: messages,
                temperature: groqConfig.generationConfig.temperature,
                top_p: groqConfig.generationConfig.top_p,
                max_tokens: groqConfig.generationConfig.max_tokens,
            });

            const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

            console.log('✅ Groq response received successfully');
            return response;
        } catch (error: any) {
            console.error('Groq API Error:', error.message);

            // Handle specific errors
            if (error.message?.includes('rate_limit') || error.status === 429) {
                throw new Error('Rate limit reached. Please wait a moment and try again. কিছুক্ষণ পর আবার চেষ্টা করুন।');
            }
            if (error.message?.includes('invalid_api_key') || error.status === 401) {
                throw new Error('Invalid API key. Please check your GROQ_API_KEY in .env file.');
            }
            if (error.message?.includes('model_not_found')) {
                throw new Error('Model not available. Please check your Groq configuration.');
            }

            throw new Error(error.message || 'Failed to generate AI response');
        }
    }

    /**
     * Create a new conversation
     */
    async createConversation(
        message: string,
        userId?: string
    ): Promise<{ _id: string; title: string; messages: MessageHistory[] }> {
        // Generate title from first message (first 50 chars)
        const title = message.length > 50 ? message.substring(0, 47) + '...' : message;

        // Get AI response
        const aiResponse = await this.generateResponse(message);

        const messages: MessageHistory[] = [
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'model', content: aiResponse, timestamp: new Date() },
        ];

        // If database is connected, save to MongoDB
        if (isDatabaseConnected()) {
            const conversation = new Conversation({
                title,
                userId,
                messages,
            });
            await conversation.save();
            return conversation as any;
        }

        // Otherwise, use in-memory storage
        const id = `temp-${Date.now()}`;
        memoryStore.set(id, { title, messages });
        return { _id: id, title, messages };
    }

    /**
     * Add message to existing conversation
     */
    async addMessage(
        conversationId: string,
        message: string
    ): Promise<{ conversation: any; response: string }> {
        // Check if using database or memory
        if (isDatabaseConnected()) {
            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                throw new Error('Conversation not found');
            }

            conversation.messages.push({
                role: 'user',
                content: message,
                timestamp: new Date(),
            });

            const aiResponse = await this.generateResponse(message, conversation.messages);

            conversation.messages.push({
                role: 'model',
                content: aiResponse,
                timestamp: new Date(),
            });

            await conversation.save();
            return { conversation, response: aiResponse };
        }

        // Memory mode
        const stored = memoryStore.get(conversationId);
        if (!stored) {
            throw new Error('Conversation not found');
        }

        stored.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date(),
        });

        const aiResponse = await this.generateResponse(message, stored.messages);

        stored.messages.push({
            role: 'model',
            content: aiResponse,
            timestamp: new Date(),
        });

        return { conversation: { _id: conversationId, ...stored }, response: aiResponse };
    }

    /**
     * Get all conversations for a user
     */
    async getConversations(userId?: string): Promise<any[]> {
        if (isDatabaseConnected()) {
            const query = userId ? { userId } : {};
            return Conversation.find(query)
                .select('_id title createdAt updatedAt')
                .sort({ updatedAt: -1 })
                .limit(50);
        }

        // Memory mode - return stored conversations
        return Array.from(memoryStore.entries()).map(([id, data]) => ({
            _id: id,
            title: data.title,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
    }

    /**
     * Get a single conversation by ID
     */
    async getConversationById(conversationId: string): Promise<any | null> {
        if (isDatabaseConnected()) {
            return Conversation.findById(conversationId);
        }

        const stored = memoryStore.get(conversationId);
        if (!stored) return null;
        return { _id: conversationId, ...stored };
    }

    /**
     * Delete a conversation
     */
    async deleteConversation(conversationId: string): Promise<boolean> {
        if (isDatabaseConnected()) {
            const result = await Conversation.findByIdAndDelete(conversationId);
            return !!result;
        }

        return memoryStore.delete(conversationId);
    }

    /**
     * Update conversation title
     */
    async updateTitle(conversationId: string, title: string): Promise<any | null> {
        if (isDatabaseConnected()) {
            return Conversation.findByIdAndUpdate(
                conversationId,
                { title },
                { new: true }
            );
        }

        const stored = memoryStore.get(conversationId);
        if (!stored) return null;
        stored.title = title;
        return { _id: conversationId, ...stored };
    }

    /**
     * Clear all conversations (for a user or all)
     */
    async clearConversations(userId?: string): Promise<number> {
        if (isDatabaseConnected()) {
            const query = userId ? { userId } : {};
            const result = await Conversation.deleteMany(query);
            return result.deletedCount;
        }

        const count = memoryStore.size;
        memoryStore.clear();
        return count;
    }
}

export const chatService = new ChatService();
