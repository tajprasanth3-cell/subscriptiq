import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import { env, dataFilePath } from '../config/env';
import { buildSeed, type DatabaseState } from '../data/seed';

type MongoDb = NonNullable<typeof mongoose.connection.db>;
type ArrayKey =
  | 'users'
  | 'organizations'
  | 'plans'
  | 'meters'
  | 'events'
  | 'invoices'
  | 'customers'
  | 'notifications'
  | 'auditLogs';

/** Maps in-memory collections to their MongoDB collection names. */
const ARRAY_COLLECTIONS: Record<ArrayKey, string> = {
  users: 'users',
  organizations: 'organizations',
  plans: 'plans',
  meters: 'meters',
  events: 'usage_events',
  invoices: 'invoices',
  customers: 'customers',
  notifications: 'alert_notifications',
  auditLogs: 'audit_logs',
};

const ARRAY_KEYS = Object.keys(ARRAY_COLLECTIONS) as ArrayKey[];

function connectedDb(): MongoDb | undefined {
  if (mongoose.connection.readyState !== 1) return undefined;
  return mongoose.connection.db;
}

function strip<T>(doc: Record<string, unknown>): T {
  const clone = { ...doc };
  delete clone._id;
  delete clone.__order;
  return clone as T;
}

/**
 * Persistence layer.
 *
 * The whole dataset is kept in memory for fast synchronous access (the service
 * layer reads `store.data`), but every mutation is flushed to MongoDB. MongoDB
 * is the source of truth on startup; the JSON file is only used as a fallback
 * when MongoDB is unreachable.
 */
export class Store {
  private state: DatabaseState;
  private persistEnabled: boolean;
  private writeQueue: Promise<void> = Promise.resolve();
  private flushScheduled = false;

  constructor(options: { persist?: boolean } = {}) {
    this.persistEnabled = options.persist ?? true;
    this.state = this.loadJson() ?? buildSeed();
    if (this.persistEnabled && !fs.existsSync(dataFilePath)) {
      this.writeToDisk(this.state);
    }
  }

  private loadJson(): DatabaseState | null {
    if (!fs.existsSync(dataFilePath)) return null;
    try {
      const raw = fs.readFileSync(dataFilePath, 'utf-8');
      return JSON.parse(raw) as DatabaseState;
    } catch {
      // Corrupted data file — fall back to a fresh seed.
      return null;
    }
  }

  private writeToDisk(state: DatabaseState): void {
    fs.mkdirSync(env.dataDir, { recursive: true });
    fs.writeFileSync(dataFilePath, JSON.stringify(state, null, 2), 'utf-8');
  }

  /**
   * Load the dataset from MongoDB. When the database is empty, the current
   * in-memory state (migrated from the JSON file, or a fresh seed) is written
   * to MongoDB so existing local data is preserved.
   */
  async init(): Promise<'mongodb' | 'json'> {
    const db = connectedDb();
    if (!db) return 'json';

    try {
      const fromMongo = await this.loadFromMongo(db);
      if (fromMongo) {
        this.state = fromMongo;
      } else {
        await this.flushToMongo();
      }
      return 'mongodb';
    } catch (error) {
      console.warn(
        `  MongoDB     : Failed to load data (${(error as Error).message}). Falling back to local persistence.`
      );
      return 'json';
    }
  }

  backend(): 'mongodb' | 'json' {
    return connectedDb() ? 'mongodb' : 'json';
  }

  private async loadFromMongo(db: MongoDb): Promise<DatabaseState | null> {
    const userCount = await db.collection(ARRAY_COLLECTIONS.users).countDocuments();
    if (userCount === 0) return null;

    const seed = buildSeed();
    const next = {} as DatabaseState;

    for (const key of ARRAY_KEYS) {
      const docs = await db
        .collection(ARRAY_COLLECTIONS[key])
        .find({})
        .sort({ __order: 1 })
        .toArray();
      (next as unknown as Record<string, unknown>)[key] = docs.map((doc) => strip(doc));
    }

    const appState = db.collection('app_state');
    const subscription = await appState.findOne({ _id: 'subscription' as never });
    const alertRules = await appState.findOne({ _id: 'alertRules' as never });
    const processed = await appState.findOne({ _id: 'processedEventIds' as never });

    next.subscription =
      (subscription?.value as DatabaseState['subscription'] | undefined) ?? seed.subscription;
    next.alertRules =
      (alertRules?.value as DatabaseState['alertRules'] | undefined) ?? seed.alertRules;
    next.processedEventIds = Array.isArray(processed?.ids)
      ? (processed.ids as string[])
      : seed.processedEventIds;

    return next;
  }

  private async flushToMongo(): Promise<void> {
    const db = connectedDb();
    if (!db) return;

    await Promise.all(
      ARRAY_KEYS.map(async (key) => {
        const collection = db.collection(ARRAY_COLLECTIONS[key]);
        const items = this.state[key] as unknown as Record<string, unknown>[];
        await collection.deleteMany({});
        if (items.length === 0) return;
        await collection.insertMany(items.map((item, index) => ({ ...item, __order: index })));
      })
    );

    const appState = db.collection('app_state');
    await Promise.all([
      appState.replaceOne(
        { _id: 'subscription' as never },
        { _id: 'subscription' as never, value: this.state.subscription },
        { upsert: true }
      ),
      appState.replaceOne(
        { _id: 'alertRules' as never },
        { _id: 'alertRules' as never, value: this.state.alertRules },
        { upsert: true }
      ),
      appState.replaceOne(
        { _id: 'processedEventIds' as never },
        { _id: 'processedEventIds' as never, ids: this.state.processedEventIds },
        { upsert: true }
      ),
    ]);
  }

  private scheduleFlush(): void {
    if (this.flushScheduled) return;
    this.flushScheduled = true;
    this.writeQueue = this.writeQueue
      .then(async () => {
        this.flushScheduled = false;
        await this.flushToMongo();
      })
      .catch((error) => {
        this.flushScheduled = false;
        console.error(`  MongoDB     : Failed to persist data (${(error as Error).message})`);
      });
  }

  /** Persist the current in-memory state to MongoDB (or the JSON fallback). */
  persist(): void {
    if (!this.persistEnabled) return;
    if (connectedDb()) {
      this.scheduleFlush();
      return;
    }
    this.writeToDisk(this.state);
  }

  /** Wait for any in-flight persistence writes to finish (used on shutdown). */
  async flush(): Promise<void> {
    this.persist();
    await this.writeQueue;
  }

  /** Direct, mutable access to the underlying state. Mutate then call persist(). */
  get data(): DatabaseState {
    return this.state;
  }

  /** Discard all changes and rebuild the seeded dataset. */
  reset(): DatabaseState {
    this.state = buildSeed();
    this.persist();
    return this.state;
  }
}

let instance: Store | null = null;

export function getStore(): Store {
  if (!instance) {
    instance = new Store();
  }
  return instance;
}

export function createStore(options?: { persist?: boolean }): Store {
  return new Store(options);
}

export function storePath(): string {
  return path.resolve(dataFilePath);
}
