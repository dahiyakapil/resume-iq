import mongoose from "mongoose"

export const dbConnect = async () => {
    try {
        // Validate MongoDB URI
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        console.log('[DATABASE] Connecting to MongoDB...');

        const connectionInstance = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
        });

        console.log(`[DATABASE] MongoDB connected successfully || Host: ${connectionInstance.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('[DATABASE] MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('[DATABASE] MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('[DATABASE] MongoDB reconnected');
        });

        return connectionInstance;

    } catch (error) {
        console.error('[DATABASE] MongoDB connection FAILED:', {
            message: error.message,
            code: error.code,
            name: error.name
        });
        throw error; // Re-throw to prevent server from starting
    }
}