export type DocumentOutputFormat = "TEXT" | "PDF";

export type DocumentOutputWorkspace = Readonly<{
  artifactId: string;
  reportId: string;
  snapshotId: string;
  format: DocumentOutputFormat;
  content: string;
  contentHash: string;
  generatedAt: string;
}>;

function deterministicContentHash(content: string): string {
  const bytes = new TextEncoder().encode(content);
  let hash = 2166136261;
  for (const byte of bytes) hash = Math.imul(hash ^ byte, 16777619);
  return (hash >>> 0).toString(16);
}

export function composeDocumentOutputWorkspace(input: Omit<DocumentOutputWorkspace, "contentHash">): DocumentOutputWorkspace {
  if (!input.artifactId.trim() || !input.reportId.trim() || !input.snapshotId.trim()) throw new Error("DOCUMENT_OUTPUT_IDENTITY_REQUIRED");
  if (!input.content.trim() || !input.generatedAt.trim()) throw new Error("DOCUMENT_OUTPUT_CONTENT_REQUIRED");
  return { ...input, contentHash: deterministicContentHash(input.content) };
}

export function assertDocumentOutputMatches(workspace: DocumentOutputWorkspace, content: string): void {
  if (deterministicContentHash(content) !== workspace.contentHash) throw new Error("DOCUMENT_OUTPUT_CONTENT_DRIFT");
}
