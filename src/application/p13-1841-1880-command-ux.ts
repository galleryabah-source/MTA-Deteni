import type { WorkbenchSection } from "./p13-601-660-operator-workbench.js";

export type CommandUxIntent = Readonly<{
  commandId: string;
  section: WorkbenchSection;
  label: string;
  requiresConfirmation: boolean;
  mutation: boolean;
}>;

export function buildCommandUxIntent(input: CommandUxIntent): CommandUxIntent {
  if (!input.commandId.trim() || !input.label.trim()) throw new Error("COMMAND_UX_IDENTITY_REQUIRED");
  if (input.mutation && !input.requiresConfirmation) throw new Error("COMMAND_UX_MUTATION_CONFIRMATION_REQUIRED");
  return input;
}
