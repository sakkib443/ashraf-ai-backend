import { Router } from 'express';
import chatRoutes from './chat.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Extrain Ai API is running!',
        timestamp: new Date().toISOString(),
    });
});

// Mount routes
router.use('/chat', chatRoutes);

export default router;
