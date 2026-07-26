import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error({ err: error }, `MongoDB connection error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
