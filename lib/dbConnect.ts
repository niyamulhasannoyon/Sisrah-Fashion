import mongoose from 'mongoose';

/**
 * Global cache interface for Mongoose connection in Serverless / Node environments.
 */
interface GlobalMongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  consecutiveFailures: number;
  circuitOpenUntil: number;
}

let cached: GlobalMongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
    consecutiveFailures: 0,
    circuitOpenUntil: 0,
  };
}

const CIRCUIT_FAILURE_THRESHOLD = 3;
const CIRCUIT_COOLDOWN_MS = 10_000; // 10s cool-down before retry when cluster is down

/**
 * Connect to MongoDB with Enterprise-grade connection resiliency,
 * tight connection pooling for serverless runtimes, and a fast-fail circuit breaker.
 */
async function dbConnect(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('[DB] Missing MONGODB_URI environment variable');
  }

  // 1. Fast path: If already connected and ready, reuse connection immediately
  if (mongoose.connection.readyState === 1) {
    cached.consecutiveFailures = 0;
    cached.circuitOpenUntil = 0;
    return mongoose;
  }

  // 2. Circuit Breaker Fast-Fail Check
  const now = Date.now();
  if (cached.circuitOpenUntil > now) {
    const remainingSec = Math.ceil((cached.circuitOpenUntil - now) / 1000);
    throw new Error(
      `[DB Circuit Breaker Open] Database is temporarily unreachable. Fast-failing for ${remainingSec}s to prevent thread saturation.`
    );
  }

  // 3. Initiate connection promise if not in flight
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 20_000,
      serverSelectionTimeoutMS: 3_000, // Fast fail in 3s rather than blocking for 30s
      connectTimeoutMS: 3_000,
      socketTimeoutMS: 15_000,
      heartbeatFrequencyMS: 10_000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((instance) => {
        cached.consecutiveFailures = 0;
        cached.circuitOpenUntil = 0;
        return instance;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        cached.consecutiveFailures += 1;

        if (cached.consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD) {
          cached.circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
          console.error(
            `[DB Circuit Breaker Tripped] ${cached.consecutiveFailures} consecutive connection failures. Circuit open for ${CIRCUIT_COOLDOWN_MS / 1000}s.`
          );
        }

        throw err;
      });
  }

  // 4. Await cached promise
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }
}

/**
 * Check if the database connection is currently alive without throwing.
 */
export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export default dbConnect;
