import type { NotificationCenterItem } from "./p13-1921-1960-notification-center.js";

export type AlertAcknowledgement = Readonly<{
  notificationId: string;
  evidenceId: string;
  acknowledgedBy: string;
  acknowledgedAt: string;
}>;

export function buildAlertAcknowledgement(item: NotificationCenterItem, acknowledgedBy: string, acknowledgedAt: string): AlertAcknowledgement {
  if (!item.notificationId.trim() || !item.sourceEvidenceId.trim() || !acknowledgedBy.trim() || !acknowledgedAt.trim()) throw new Error("ALERT_ACK_IDENTITY_REQUIRED");
  return { notificationId: item.notificationId, evidenceId: item.sourceEvidenceId, acknowledgedBy, acknowledgedAt };
}
