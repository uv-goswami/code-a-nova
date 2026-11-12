// In-memory MongoDB for integration tests. Set MONGOMS_SYSTEM_BINARY to use a local mongod.
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | undefined;

export const connect = async (): Promise<void> => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  // Make sure unique indexes exist before tests run.
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
};

export const clear = async (): Promise<void> => {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
};

export const close = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
};
