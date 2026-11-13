import fs from 'node:fs';
import path from 'node:path';
import { env, dataFilePath } from '../config/env';
import { buildSeed, type DatabaseState } from '../data/seed';

/**
 * File-backed persistence layer.
 *
 * The entire database state is kept in memory for fast synchronous access and
 * flushed to a JSON file after every mutation. The file is small (a demo
 * dataset), so synchronous writes are cheap and keep the code simple. Swap this
 * class for a real database client without touching the service layer.
 */
export class Store {
  private state: DatabaseState;
  private persistEnabled: boolean;

  constructor(options: { persist?: boolean } = {}) {
    this.persistEnabled = options.persist ?? true;
    this.state = this.load();
  }

  private load(): DatabaseState {
    if (this.persistEnabled && fs.existsSync(dataFilePath)) {
      try {
        const raw = fs.readFileSync(dataFilePath, 'utf-8');
        return JSON.parse(raw) as DatabaseState;
      } catch {
        // Corrupted data file — fall back to a fresh seed.
      }
    }
    const seed = buildSeed();
    if (this.persistEnabled) {
      this.writeToDisk(seed);
    }
    return seed;
  }

  private writeToDisk(state: DatabaseState): void {
    fs.mkdirSync(env.dataDir, { recursive: true });
    fs.writeFileSync(dataFilePath, JSON.stringify(state, null, 2), 'utf-8');
  }

  /** Persist the current in-memory state to disk. */
  persist(): void {
    if (!this.persistEnabled) return;
    this.writeToDisk(this.state);
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
