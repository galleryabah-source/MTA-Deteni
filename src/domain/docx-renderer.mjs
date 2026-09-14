import { createHash } from 'node:crypto';

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & (-(crc & 1)));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value) { const b = Buffer.alloc(2); b.writeUInt16LE(value); return b; }
function u32(value) { const b = Buffer.alloc(4); b.writeUInt32LE(value >>> 0); return b; }

function zipStore(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const data = Buffer.from(entry.data, 'utf8');
    const crc = crc32(data);
    const local = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]), u16(20), u16(0x0800), u16(0),
      u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name, data,
    ]);
    locals.push(local);
    centrals.push(Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x01, 0x02]), u16(20), u16(20), u16(0x0800), u16(0),
      u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name,
    ]));
    offset += local.length;
  }
  const central = Buffer.concat(centrals);
  const body = Buffer.concat([...locals, central]);
  const eocd = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x05, 0x06]), u16(0), u16(0), u16(entries.length), u16(entries.length),
    u32(central.length), u32(body.length - central.length), u16(0),
  ]);
  return Buffer.concat([body, eocd]);
}

function paragraph(text, bold = false) {
  const rPr = bold ? '<w:rPr><w:b/></w:rPr>' : '';
  return `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t>${rPr}</w:r></w:p>`;
}

function documentXml(title, manifest, data) {
  const rows = manifest.fields.map((field) => paragraph(`${field.name}: ${data[field.name] ?? ''}`)).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraph(title, true)}${rows}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`;
const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`;
const DOC_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;
const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/></w:rPr></w:style></w:styles>`;

export function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }

export function renderDocx({ manifest, data, title = manifest?.documentKind }) {
  if (!manifest || !Array.isArray(manifest.fields)) throw new Error('Template manifest is required');
  if (!data || typeof data !== 'object') throw new Error('Template data is required');
  const normalized = {};
  for (const field of manifest.fields) {
    const value = data[field.name];
    if (field.required && (value === undefined || value === null || value === '')) throw new Error(`Missing required template field: ${field.name}`);
    normalized[field.name] = value ?? null;
  }
  const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">${xmlEscape(title)}</dc:title><dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">MTA DETENI</dc:creator></cp:coreProperties>`;
  const entries = [
    { name: '[Content_Types].xml', data: CONTENT_TYPES },
    { name: '_rels/.rels', data: ROOT_RELS },
    { name: 'docProps/core.xml', data: core },
    { name: 'word/_rels/document.xml.rels', data: DOC_RELS },
    { name: 'word/document.xml', data: documentXml(title, manifest, normalized) },
    { name: 'word/styles.xml', data: STYLES },
  ];
  const buffer = zipStore(entries);
  const digest = sha256(buffer);
  return Object.freeze({
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileExtension: '.docx',
    buffer,
    sha256: digest,
    artifactId: `docx-${digest.slice(0, 32)}`,
    templateId: manifest.templateId,
    templateVersion: manifest.templateVersion,
    rendererVersion: manifest.rendererVersion,
  });
}
