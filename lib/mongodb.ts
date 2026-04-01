import mongoose from "mongoose";

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
  const mongoDbUri = process.env.MONGODB_URI;
  if (!mongoDbUri) {
    throw new Error("Please define the MONGODB_URI environment variable.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Disable buffering so failed connections surface immediately.
    cached.promise = mongoose
      .connect(mongoDbUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 15000,
      })
      .then((instance) => instance);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Reset failed promise so subsequent requests can retry a fresh connection.
    cached.promise = null;

    const message = error instanceof Error ? error.message : "unknown";
    if (
      /could not connect to any servers|replicasetnoprimary|whitelist|econnreset|timed out|mongo(serverselection|network)/i.test(
        message
      )
    ) {
      throw new Error(
        "Could not connect to MongoDB Atlas. Check Atlas Network Access (IP whitelist), cluster status, and MONGODB_URI."
      );
    }

    throw error;
  }
}
