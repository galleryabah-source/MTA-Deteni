const DOCUMENT_KINDS = Object.freeze({
  TEMPORARY_EXIT_PERMISSION: 'TEMPORARY_EXIT_PERMISSION',
  ESCORT_ASSIGNMENT_LETTER: 'ESCORT_ASSIGNMENT_LETTER',
});

const FIELD_TYPES = new Set(['string', 'date', 'datetime', 'number', 'boolean']);

function requiredString(value, name) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${name} is required`);
  return value.trim();
}

export function createTemplateManifest({
  templateId,
  templateVersion,
  documentKind,
  fields,
  rendererVersion = 'docx-renderer.v1',
}) {
  requiredString(templateId, 'templateId');
  requiredString(templateVersion, 'templateVersion');
  requiredString(rendererVersion, 'rendererVersion');
  if (!Object.values(DOCUMENT_KINDS).includes(documentKind)) throw new Error('Unsupported document kind');
  if (!Array.isArray(fields) || fields.length === 0) throw new Error('At least one template field is required');

  const names = new Set();
  const normalized = fields.map((field) => {
    const name = requiredString(field?.name, 'field.name');
    if (names.has(name)) throw new Error(`Duplicate template field: ${name}`);
    names.add(name);
    const type = requiredString(field?.type, `field ${name} type`);
    if (!FIELD_TYPES.has(type)) throw new Error(`Unsupported field type: ${type}`);
    if (field.source !== 'authorization' && field.source !== 'document' && field.source !== 'system') {
      throw new Error(`Invalid field source: ${name}`);
    }
    return Object.freeze({ name, type, source: field.source, required: field.required !== false });
  });

  return Object.freeze({
    manifestVersion: 1,
    templateId,
    templateVersion,
    documentKind,
    rendererVersion,
    fields: Object.freeze(normalized),
  });
}

export function validateTemplateData(manifest, data) {
  if (!manifest || !Array.isArray(manifest.fields)) throw new Error('Template manifest is required');
  if (!data || typeof data !== 'object') throw new Error('Template data is required');

  const output = {};
  for (const field of manifest.fields) {
    const value = data[field.name];
    if (field.required && (value === undefined || value === null || value === '')) {
      throw new Error(`Missing required template field: ${field.name}`);
    }
    if (value === undefined || value === null) continue;
    if (field.type === 'string' && typeof value !== 'string') throw new Error(`Invalid type for ${field.name}`);
    if (field.type === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) throw new Error(`Invalid type for ${field.name}`);
    if (field.type === 'boolean' && typeof value !== 'boolean') throw new Error(`Invalid type for ${field.name}`);
    if ((field.type === 'date' || field.type === 'datetime') && typeof value !== 'string') throw new Error(`Invalid type for ${field.name}`);
    output[field.name] = value;
  }
  return Object.freeze(output);
}

export function canonicalTemplateData(manifest, data) {
  const validated = validateTemplateData(manifest, data);
  const ordered = {};
  for (const field of manifest.fields) ordered[field.name] = validated[field.name] ?? null;
  return JSON.stringify(ordered);
}
