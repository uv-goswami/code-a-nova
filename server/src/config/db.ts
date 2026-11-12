import mongoose from 'mongoose';

// Opens the MongoDB connection (used by server.ts and test helpers).
export async function connectDb(uri: string): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
