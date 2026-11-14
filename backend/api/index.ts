import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from '../src/app';
import { getStore } from '../src/store/store';
import { connectDatabase } from '../src/config/db';

const app = createApp();
const store = getStore();
let isReady = false;

async function ensureInit() {
  if (!isReady) {
    try {
      await connectDatabase();
    } catch {
      // Continue with in-memory / JSON store fallback
    }
    await store.init();
    isReady = true;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ensureInit();
  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}
