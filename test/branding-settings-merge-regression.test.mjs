import assert from "node:assert/strict";
import fs from "node:fs";

const api = fs.readFileSync("supabase/functions/mta-api/index.ts", "utf8");
const commands = fs.readFileSync("web/mta-domain-commands-v2.js", "utf8");

assert.match(api, /const incomingSettings=body\.settings&&typeof body\.settings==="object"\?body\.settings:\{\}/);
assert.match(api, /const existingBranding=existingSettings\.branding&&typeof existingSettings\.branding==="object"\?existingSettings\.branding:\{\}/);
assert.match(api, /settings\.branding=\{\.\.\.existingBranding,\.\.\.incomingSettings\.branding\}/);
assert.match(commands, /\.\.\.currentBranding,\[key\]:String\(o\.data\|\|'\'\)\}/);

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
