import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URL || '';

if (!MONGODB_URI) {
  throw new Error(' MONGODB_URI is not defined in environment variables');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'FLOWA_AI_DB', 
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}