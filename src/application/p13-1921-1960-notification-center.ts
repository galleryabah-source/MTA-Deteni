import type { OperationalNotification } from "./p13-961-1000-notification-recommendation.js";

export type NotificationCenterItem = Readonly<OperationalNotification & { acknowledged: boolean }>;

export function composeNotificationCenter(items: readonly NotificationCenterItem[]): readonly NotificationCenterItem[] {
  return [...items].sort((a, b) => {
    const priority = { CRITICAL: 0, WARNING: 1, INFO: 2 } as const;
    return priority[a.priority] - priority[b.priority] || Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}

export function acknowledgeNotification(item: NotificationCenterItem): NotificationCenterItem {
  if (!item.notificationId.trim() || !item.sourceEvidenceId.trim()) throw new Error("NOTIFICATION_EVIDENCE_REQUIRED");
  return { ...item, acknowledged: true };
}
