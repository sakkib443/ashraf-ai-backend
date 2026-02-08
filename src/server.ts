import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import createApp from './app';
import { connectDatabase } from './config';

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
    try {
        // Connect to MongoDB
        await connectDatabase();

        // Create Express app
        const app = createApp();

        // Start server
        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🤖 Extrain Ai Backend Server                            ║
║                                                           ║
║   ✅ Server is running on port ${PORT}                      ║
║   📍 Local: http://localhost:${PORT}                        ║
║   🌐 API: http://localhost:${PORT}/api                      ║
║   💚 Health: http://localhost:${PORT}/api/health            ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
startServer();
