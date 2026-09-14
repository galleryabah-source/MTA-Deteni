export interface MergeResult {
  readonly content: string;
  readonly placeholders: readonly string[];
}

const PLACEHOLDER = /\{\{\s*([A-Za-z][A-Za-z0-9_.-]*)\s*\}\}/g;

export const extractPlaceholders = (template: string): readonly string[] =>
  [...template.matchAll(PLACEHOLDER)].map((match) => match[1]).filter((v, i, a) => a.indexOf(v) === i);

export const mergeTemplate = (
  template: string,
  data: Readonly<Record<string, string | number | boolean>>,
): MergeResult => {
  const placeholders = extractPlaceholders(template);
  for (const key of placeholders) {
    if (!(key in data)) throw new Error(`MISSING_PLACEHOLDER:${key}`);
  }
  const content = template.replace(PLACEHOLDER, (_, key: string) => String(data[key]));
  return { content, placeholders };
};
