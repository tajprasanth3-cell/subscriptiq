import type { Store } from '../store/store';
import type { AuditLog, Role } from '../types';
import { createId, relativeTime } from '../utils/id';

export interface AuditActor {
  who: string;
  role: Role | string;
}

/** Append a tamper-evident audit entry to the ledger. */
export function recordAudit(store: Store, actor: AuditActor, change: string): AuditLog {
  const entry: AuditLog = {
    id: createId('aud'),
    who: actor.who,
    role: actor.role,
    change,
    timestamp: relativeTime(),
  };
  store.data.auditLogs.unshift(entry);
  return entry;
}
