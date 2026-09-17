import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'web/admin-settings-v9.js',
  'web/movement-v9.js',
  'web/room-ops-v9.js',
  'web/master-room-guard-v10.js',
  'worker-v9.js'
];

for (const rel of files) {
  const file = resolve(root, rel);
  if (!existsSync(file)) throw new Error(`MISSING: ${rel}`);
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  console.log(`PASS syntax: ${rel}`);
}

const worker = readFileSync(resolve(root, 'worker-v9.js'), 'utf8');
const wrangler = readFileSync(resolve(root, 'wrangler.toml'), 'utf8');
const guard = readFileSync(resolve(root, 'web/master-room-guard-v10.js'), 'utf8');

const required = [
  ['worker injects master-room guard', worker.includes('/master-room-guard-v10.js?v=10')],
  ['worker keeps run_worker_first', wrangler.includes('run_worker_first = ["/*"]')],
  ['guard decouples room state from QR state', guard.includes('ROOM_STATUS_INDEPENDENT_OF_QR_STATUS')],
  ['guard preserves QR state on room edit', guard.includes('QR_STATE_PRESERVED_ON_ROOM_EDIT')],
  ['guard enforces master-room-only placement', guard.includes('MASTER_ROOM_ONLY')],
  ['guard enforces capacity', guard.includes('CAPACITY_ENFORCED')],
  ['guard keeps transfer-only room changes', guard.includes('TRANSFER_ONLY_FOR_ROOM_CHANGE')]
];

for (const [label, ok] of required) {
  if (!ok) throw new Error(`FAIL contract: ${label}`);
  console.log(`PASS contract: ${label}`);
}

console.log('MASTER_ROOM_CONTRACT_CHECK=PASS');
