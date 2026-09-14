export interface WorkflowActor {
  userId: string;
  roles: readonly string[];
}

export interface WorkflowTransition<S extends string> {
  from: S;
  to: S;
  requiredPermission?: string;
  requiresDifferentActorFrom?: string;
  requiresSecondApproval?: boolean;
}

export interface WorkflowTransitionRequest<S extends string> {
  currentState: S;
  targetState: S;
  actor: WorkflowActor;
  secondApproverUserId?: string;
  idempotencyKey: string;
}

export interface WorkflowTransitionResult<S extends string> {
  allowed: boolean;
  from: S;
  to: S;
  reason:
    | "ALLOWED"
    | "TRANSITION_NOT_DEFINED"
    | "SECOND_APPROVAL_REQUIRED"
    | "SEPARATION_OF_DUTIES_REQUIRED"
    | "PERMISSION_REQUIRED";
}
