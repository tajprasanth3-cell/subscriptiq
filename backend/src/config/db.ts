import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env';

// Ensure reliable SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore if custom DNS cannot be set
}

export async function connectDatabase(): Promise<boolean> {
  if (!env.mongoUri) {
    console.log('  MongoDB     : No MONGODB_URI specified (running in local file/in-memory mode)');
    return false;
  }

  // Mask password for safe logging
  const maskedUri = env.mongoUri.replace(/:([^:@]+)@/, ':****@');

  try {
    console.log(`  MongoDB     : Connecting to ${maskedUri}...`);
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('  MongoDB     : Connected successfully to MongoDB Atlas cluster');
    return true;
  } catch (error) {
    const err = error as Error;
    console.warn(`  MongoDB     : Connection warning (${err.message}). Falling back to local persistence.`);
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
