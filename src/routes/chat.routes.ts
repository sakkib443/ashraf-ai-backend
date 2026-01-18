import { Router } from 'express';
import { chatController } from '../controllers';
import { chatRateLimiter } from '../middlewares';

const router = Router();

// Apply rate limiter to all chat routes
router.use(chatRateLimiter);

// Send a message (create or continue conversation)
router.post('/', (req, res) => chatController.sendMessage(req, res));

// Get all conversations
router.get('/conversations', (req, res) => chatController.getConversations(req, res));

// Get a single conversation
router.get('/conversations/:id', (req, res) => chatController.getConversation(req, res));

// Update conversation title
router.patch('/conversations/:id', (req, res) => chatController.updateConversation(req, res));

// Delete a conversation
router.delete('/conversations/:id', (req, res) => chatController.deleteConversation(req, res));

// Clear all conversations
router.delete('/conversations', (req, res) => chatController.clearConversations(req, res));

export default router;
