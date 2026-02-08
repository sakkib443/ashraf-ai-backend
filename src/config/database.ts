import mongoose from 'mongoose';

let isConnected = false;

export const connectDatabase = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/extrainai';

        // Set a shorter timeout for faster failure
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
        });

        isConnected = true;
        console.log('✅ MongoDB Connected Successfully');

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
            isConnected = false;
        });

    } catch (error) {
        console.warn('⚠️ MongoDB Connection Failed - Running in stateless mode');
        console.warn('   Chat will work but conversations will not be saved.');
        isConnected = false;
        // Don't exit, continue without database
    }
};

export const isDatabaseConnected = (): boolean => {
    return isConnected;
};

export const disconnectDatabase = async (): Promise<void> => {
    try {
        await mongoose.connection.close();
        console.log('📴 MongoDB Disconnected');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
    }
};
