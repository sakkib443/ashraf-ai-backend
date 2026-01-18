import { Request, Response } from 'express';
import { chatService } from '../services';
import { IApiResponse } from '../types';

export class ChatController {
    /**
     * Send a chat message
     * POST /api/chat
     */
    async sendMessage(req: Request, res: Response): Promise<void> {
        try {
            const { message, conversationId, userId } = req.body;

            // Debug: Check if API key exists in Vercel
            if (!process.env.GROQ_API_KEY) {
                res.status(500).json({
                    success: false,
                    message: 'BACKEND ERROR: GROQ_API_KEY is missing in Vercel Environment Variables. Please add it in Vercel Settings.',
                });
                return;
            }

            if (!message || typeof message !== 'string' || message.trim() === '') {
                res.status(400).json({
                    success: false,
                    message: 'Message is required',
                } as IApiResponse);
                return;
            }

            let responseData;

            if (conversationId) {
                // Continue existing conversation
                const { conversation, response } = await chatService.addMessage(
                    String(conversationId),
                    message.trim()
                );
                responseData = {
                    response,
                    conversationId: conversation._id,
                    conversation,
                };
            } else {
                // Start new conversation - Pass userId for privacy
                const conversation = await chatService.createConversation(message.trim(), userId ? String(userId) : undefined);
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                responseData = {
                    response: lastMessage.content,
                    conversationId: conversation._id,
                    conversation,
                };
            }

            res.status(200).json({
                success: true,
                message: 'Message sent successfully',
                data: responseData,
            } as IApiResponse);
        } catch (error: any) {
            console.error('Chat Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process message',
                error: error.message,
            } as IApiResponse);
        }
    }

    /**
     * Get all conversations
     * GET /api/chat/conversations
     */
    async getConversations(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.query.userId as string | undefined;

            // If No userId is provided, we return empty list to maintain privacy
            const conversations = await chatService.getConversations(userId);

            res.status(200).json({
                success: true,
                message: 'Conversations retrieved successfully',
                data: conversations,
            } as IApiResponse);
        } catch (error: any) {
            console.error('Get Conversations Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get conversations',
                error: error.message,
            } as IApiResponse);
        }
    }

    /**
     * Get a single conversation
     * GET /api/chat/conversations/:id
     */
    async getConversation(req: Request, res: Response): Promise<void> {
        try {
            const id = String(req.params.id);
            const conversation = await chatService.getConversationById(id);

            if (!conversation) {
                res.status(404).json({
                    success: false,
                    message: 'Conversation not found',
                } as IApiResponse);
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Conversation retrieved successfully',
                data: conversation,
            } as IApiResponse);
        } catch (error: any) {
            console.error('Get Conversation Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get conversation',
                error: error.message,
            } as IApiResponse);
        }
    }

    /**
     * Delete a conversation
     * DELETE /api/chat/conversations/:id
     */
    async deleteConversation(req: Request, res: Response): Promise<void> {
        try {
            const id = String(req.params.id);
            const deleted = await chatService.deleteConversation(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Conversation not found',
                } as IApiResponse);
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Conversation deleted successfully',
            } as IApiResponse);
        } catch (error: any) {
            console.error('Delete Conversation Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete conversation',
                error: error.message,
            } as IApiResponse);
        }
    }

    /**
     * Update conversation title
     * PATCH /api/chat/conversations/:id
     */
    async updateConversation(req: Request, res: Response): Promise<void> {
        try {
            const id = String(req.params.id);
            const { title } = req.body;

            if (!title || typeof title !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Title is required',
                } as IApiResponse);
                return;
            }

            const conversation = await chatService.updateTitle(id, title);

            if (!conversation) {
                res.status(404).json({
                    success: false,
                    message: 'Conversation not found',
                } as IApiResponse);
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Conversation updated successfully',
                data: conversation,
            } as IApiResponse);
        } catch (error: any) {
            console.error('Update Conversation Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update conversation',
                error: error.message,
            } as IApiResponse);
        }
    }

    /**
     * Clear all conversations
     * DELETE /api/chat/conversations
     */
    async clearConversations(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.query.userId as string | undefined;
            const deletedCount = await chatService.clearConversations(userId);

            res.status(200).json({
                success: true,
                message: `${deletedCount} conversations deleted`,
                data: { deletedCount },
            } as IApiResponse);
        } catch (error: any) {
            console.error('Clear Conversations Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to clear conversations',
                error: error.message,
            } as IApiResponse);
        }
    }
}

export const chatController = new ChatController();
