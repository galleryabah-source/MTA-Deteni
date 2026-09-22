import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

test("application shell inline runtime script parses as JavaScript", async () => {
  const html = await readFile(new URL("../web/index.html", import.meta.url), "utf8");
  const scripts = [...html.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)].map(m => m[1]);
  assert.ok(scripts.length > 0);
  assert.doesNotThrow(() => new vm.Script(scripts.at(-1), { filename: "web/index.html#runtime" }));
});

test("CLOUD runtime cannot silently persist browser localStorage state", async () => {
  const html = await readFile(new URL("../web/index.html", import.meta.url), "utf8");
  assert.match(html, /function isCloudRuntime\(\)/);
  assert.match(html, /function save\(\)\{if\(isCloudRuntime\(\)\)return/);
  assert.match(html, /async function syncCloudDomain\(\)/);
  assert.match(html, /window\.MTADeteniSharedDomain\.listPlacements/);
  assert.match(html, /window\.MTADeteniSharedDomain\.listMovements/);
  assert.match(html, /window\.MTADeteniSharedDomain\.listLeaves/);
  assert.match(html, /window\.MTADeteniSharedDomain\.listDocuments/);
});
