import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;
let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    // Use MongoDB Memory Server for development
    if (process.env.NODE_ENV !== 'production') {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log('Connected to MongoDB Memory Server successfully');
    } else {
      // Use provided MongoDB URI for production
      const MONGODB_URI = process.env.MONGODB_URI;
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is required in production');
      }
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB successfully');
    }
    
    isConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectFromDatabase() {
  if (isConnected) {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    isConnected = false;
    console.log('Disconnected from MongoDB');
  }
}

// Initialize connection when the module is imported
connectToDatabase().catch(console.error);

export default mongoose;