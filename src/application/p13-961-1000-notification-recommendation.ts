export type NotificationPriority = "INFO" | "WARNING" | "CRITICAL";

export type OperationalNotification = Readonly<{
  notificationId: string;
  subject: string;
  priority: NotificationPriority;
  sourceEvidenceId: string;
  recipientRole: string;
  createdAt: string;
}>;

export type RecommendationBoundary = Readonly<{
  recommendationId: string;
  subject: string;
  sourceEvidenceId: string;
  issuedBy: string;
  requiresHumanDecision: true;
}>;

export function buildOperationalNotification(input: OperationalNotification): OperationalNotification {
  if (!input.notificationId.trim() || !input.subject.trim() || !input.sourceEvidenceId.trim() || !input.recipientRole.trim() || !input.createdAt.trim()) throw new Error("NOTIFICATION_IDENTITY_REQUIRED");
  return input;
}

export function buildRecommendationBoundary(input: Omit<RecommendationBoundary, "requiresHumanDecision">): RecommendationBoundary {
  if (!input.recommendationId.trim() || !input.subject.trim() || !input.sourceEvidenceId.trim() || !input.issuedBy.trim()) throw new Error("RECOMMENDATION_IDENTITY_REQUIRED");
  return { ...input, requiresHumanDecision: true };
}
