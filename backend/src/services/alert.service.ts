import type { Store } from '../store/store';
import type { AlertNotification, AlertRules, Paginated } from '../types';
import { ApiError } from '../utils/ApiError';
import { createId, relativeTime } from '../utils/id';
import { recordAudit, type AuditActor } from './audit.service';

export function getAlertRules(store: Store): AlertRules {
  return store.data.alertRules;
}

export function updateAlertRules(store: Store, rules: AlertRules, actor: AuditActor): AlertRules {
  if (rules.secondAlertPercentage <= rules.firstAlertPercentage) {
    throw ApiError.unprocessable('Second alert percentage must be greater than the first');
  }
  store.data.alertRules = { ...rules };
  recordAudit(
    store,
    actor,
    `Updated limits: ${rules.firstAlertPercentage}% / ${rules.secondAlertPercentage}% (${rules.actionOnExceed})`
  );
  store.persist();
  return store.data.alertRules;
}

export interface ListNotificationsQuery {
  page: number;
  pageSize: number;
}

export function listNotifications(
  store: Store,
  query: ListNotificationsQuery
): Paginated<AlertNotification> & { unreadCount: number } {
  const all = store.data.notifications;
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.pageSize;
  return {
    items: all.slice(start, start + query.pageSize),
    total,
    page,
    pageSize: query.pageSize,
    totalPages,
    unreadCount: all.filter((n) => n.unread).length,
  };
}

export function triggerTestAlert(
  store: Store,
  message = 'Test Alert: API usage passed 90% threshold'
): AlertNotification {
  const notification: AlertNotification = {
    id: createId('notif'),
    type: 'Threshold',
    message,
    timestamp: relativeTime(),
    unread: true,
  };
  store.data.notifications.unshift(notification);
  store.persist();
  return notification;
}

export function markAllNotificationsRead(store: Store): number {
  let updated = 0;
  for (const notification of store.data.notifications) {
    if (notification.unread) {
      notification.unread = false;
      updated += 1;
    }
  }
  store.persist();
  return updated;
}

export function unreadCount(store: Store): number {
  return store.data.notifications.filter((n) => n.unread).length;
}
