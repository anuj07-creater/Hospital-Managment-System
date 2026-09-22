import mongoose from 'mongoose';
import { seedMongoDatabase } from '../services/dbSeeder';

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.info('ℹ️  MONGODB_URI not set. Configure MONGODB_URI in .env or the Secrets panel to connect to MongoDB Atlas.');
    return false;
  }

  // Handle connection events
  mongoose.connection.on('connected', () => {
    console.log(`✅ MongoDB Atlas Connected: ${mongoose.connection.host} (DB: ${mongoose.connection.name})`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB Atlas Connection Error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB Atlas Disconnected');
  });

  try {
    // Connect with Mongoose
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    // Seed database if empty
    await seedMongoDatabase();

    return true;
  } catch (error) {
    console.warn('⚠️  Could not connect to MongoDB Atlas directly.', (error as Error).message);
    return false;
  }
}
