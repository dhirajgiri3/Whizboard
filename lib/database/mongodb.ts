import { MongoClient, Db } from 'mongodb';
import logger from '../logger/logger';
import '../env';

// Fix EventEmitter memory leak warning in development
if (process.env.NODE_ENV === 'development') {
  process.setMaxListeners(20); // Increase limit for Next.js development mode
}

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 2, // Reduced from 5 to 2 to prevent excess connections
  maxIdleTimeMS: 30000,
  // Fix EventEmitter memory leak
  maxConnecting: 2,
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoDbCache: Db | undefined;
}

// Create a new MongoClient instance with null initialization
let client: MongoClient | null = null;

// Define the client promise
let clientPromise: Promise<MongoClient>;

// Initialize client promise
if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
    logger.info('Creating new MongoDB connection (development).');
  } else {
    logger.debug('Reusing existing MongoDB connection (development).');
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
  logger.info('Creating new MongoDB connection (production).');
}

// Cache the database connection globally
const getCachedDb = (): Db | undefined => {
  if (process.env.NODE_ENV === 'development') {
    return global._mongoDbCache;
  }
  return undefined;
};

const setCachedDb = (db: Db): void => {
  if (process.env.NODE_ENV === 'development') {
    global._mongoDbCache = db;
  }
};

export async function connectToDatabase(): Promise<Db> {
  // Check global cache first (for development HMR)
  const globalCache = getCachedDb();
  if (globalCache) {
    return globalCache;
  }

  try {

    const mongoClient = await clientPromise;
    const dbName = process.env.DB_NAME || 'whizboard';
    const db = mongoClient.db(dbName);

    // Only ping on first connection to verify it works
    try {
      await db.admin().ping();
      logger.info(`Successfully connected to MongoDB database: ${dbName}`);
    } catch (pingError) {
      logger.warn('MongoDB ping failed, but connection may still work:', pingError);
    }

    // Cache the connection globally
    setCachedDb(db);

    return db;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
// This is used by NextAuth adapter and should connect to the same database
export default clientPromise; 