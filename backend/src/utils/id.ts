import { randomUUID } from 'node:crypto';

/** Generate a unique, prefixed identifier, e.g. `evt_3f9a...`. */
export function createId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

/** Human friendly relative time used for event/notification timestamps. */
export function relativeTime(date: Date = new Date()): string {
  return 'Just now';
}
