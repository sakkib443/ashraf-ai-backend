import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler, notFoundHandler, generalRateLimiter } from './middlewares';

const createApp = (): Application => {
    const app = express();

    // Security middleware
    app.use(helmet());

    // CORS configuration
    app.use(cors({
        origin: true, // Allow all origins during initial deployment test
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Request logging
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else {
        app.use(morgan('combined'));
    }

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    app.use(generalRateLimiter);

    // API Routes
    app.use('/api', routes);

    // Root route
    app.get('/', (req, res) => {
        res.json({
            success: true,
            message: '🚀 Welcome to AshrafAI API',
            version: '1.0.0',
            docs: '/api/health',
        });
    });

    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
};

export default createApp;
