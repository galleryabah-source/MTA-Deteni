import type {
  WorkflowTransition,
  WorkflowTransitionRequest,
  WorkflowTransitionResult,
} from "./types";

export class StateMachine<S extends string> {
  constructor(
    private readonly transitions: readonly WorkflowTransition<S>[],
    private readonly permissionCheck: (permission: string, actor: WorkflowTransitionRequest<S>["actor"]) => boolean = () => true,
  ) {}

  transition(request: WorkflowTransitionRequest<S>): WorkflowTransitionResult<S> {
    const transition = this.transitions.find(
      (candidate) => candidate.from === request.currentState && candidate.to === request.targetState,
    );

    if (!transition) {
      return {
        allowed: false,
        from: request.currentState,
        to: request.targetState,
        reason: "TRANSITION_NOT_DEFINED",
      };
    }

    if (
      transition.requiresDifferentActorFrom &&
      transition.requiresDifferentActorFrom === request.actor.userId
    ) {
      return {
        allowed: false,
        from: request.currentState,
        to: request.targetState,
        reason: "SEPARATION_OF_DUTIES_REQUIRED",
      };
    }

    if (transition.requiresSecondApproval && !request.secondApproverUserId) {
      return {
        allowed: false,
        from: request.currentState,
        to: request.targetState,
        reason: "SECOND_APPROVAL_REQUIRED",
      };
    }

    if (
      transition.requiredPermission &&
      !this.permissionCheck(transition.requiredPermission, request.actor)
    ) {
      return {
        allowed: false,
        from: request.currentState,
        to: request.targetState,
        reason: "PERMISSION_REQUIRED",
      };
    }

    return {
      allowed: true,
      from: request.currentState,
      to: request.targetState,
      reason: "ALLOWED",
    };
  }
}
