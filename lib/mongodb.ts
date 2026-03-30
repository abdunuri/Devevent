import mongoose from "mongoose";

const mongoDbUri = process.env.MONGODB_URI;

if (!mongoDbUri) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}
const MONGODB_URI: string = mongoDbUri;

const MONGODB_URI: string = mongoDbUri;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Reuse a single cached connection across hot reloads in development.
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const globalWithMongoose = global as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cached = globalWithMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalWithMongoose.mongooseCache = cached;

export default async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Disable buffering so failed connections surface immediately.
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((instance) => instance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
