import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const api = fs.readFileSync("supabase/functions/mta-api/index.ts", "utf8");
const commands = fs.readFileSync("web/mta-domain-commands-v2.js", "utf8");
const admin = fs.readFileSync("web/admin-settings-v9.js", "utf8");

assert.match(api, /const incomingSettings=body\.settings&&typeof body\.settings==="object"\?body\.settings:\{\}/);
assert.match(api, /const existingBranding=existingSettings\.branding&&typeof existingSettings\.branding==="object"\?existingSettings\.branding:\{\}/);
assert.match(api, /settings\.branding=\{\.\.\.existingBranding,\.\.\.incomingSettings\.branding\}/);
assert.ok(commands.includes("...currentBranding,[key]:String(o.data||'')}"));
assert.ok(admin.includes("container.querySelector('.logo,.mta-auth-logo')"));
assert.ok(admin.includes("document.querySelector('#appView .hero,.main .hero,.hero')"));
assert.ok(admin.includes("img.mta-brand-header-image"));
assert.ok(admin.includes("applyHeaderImage(document.querySelector('.top'),'top')"));
assert.ok(admin.includes("applyHeaderImage(document.querySelector('#appView .hero,.main .hero,.hero'),'hero')"));
const runtime = fs.readFileSync("web/mta-app-runtime-full.js", "utf8");
assert.ok(runtime.includes("admin-settings-v9.js?v=6"));
assert.ok(admin.includes("settings();applyWebBranding();toast('Pengaturan desain web tersimpan.')"));

test("branding updates preserve all previously saved nested branding fields", () => {
  const previous = {
    title: "MTA DETENI",
    branding: { iconData: "icon-v1", logoData: "logo-v1", headerData: "header-v1" }
  };
  const incoming = { branding: { logoData: "logo-v2" } };
  const settings = { ...previous, ...incoming, branding: { ...previous.branding, ...incoming.branding } };
  assert.deepEqual(settings.branding, {
    iconData: "icon-v1",
    logoData: "logo-v2",
    headerData: "header-v1"
  });
  assert.equal(settings.title, "MTA DETENI");
});
