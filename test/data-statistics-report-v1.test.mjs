import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("web/index.html","utf8");
const report=fs.readFileSync("web/data-statistics-report-v1.js","utf8");

test("data statistics module is syntactically valid JavaScript",()=>{\n  assert.doesNotThrow(()=>new Function(report));\n});\n\ntest("data statistics menu and reporting module are wired",()=>{
  assert.match(index,/data-view="detainee-statistics">Data Statistik/);
  assert.match(index,/data-statistics-report-v1\.js\?v=1/);
  assert.match(report,/mtaProductionStateAdapter/);
  assert.match(report,/MTADeteniStateKernel/);
});

test("reporting has daily monthly yearly and detainee views with filters",()=>{
  assert.match(report,/Data Harian/);
  assert.match(report,/Data Bulanan/);
  assert.match(report,/Data Tahunan/);
  assert.match(report,/Data Deteni/);
  assert.match(report,/mtaFStart/);
  assert.match(report,/mtaFEnd/);
  assert.match(report,/mtaFGender/);
  assert.match(report,/mtaFNationality/);
  assert.match(report,/mtaFStatus/);
  assert.match(report,/mtaFBlock/);
  assert.match(report,/mtaFRoom/);
});

test("statistics include requested categorizations and diagrams",()=>{
  assert.match(report,/Jenis Kelamin/);
  assert.match(report,/Kebangsaan/);
  assert.match(report,/Status Deteni/);
  assert.match(report,/Kelompok Usia/);
  assert.match(report,/conic-gradient/);
  assert.match(report,/mta-bar-fill/);
});

test("exports are real XLSX and PDF downloads",()=>{
  assert.match(report,/cdn\.sheetjs\.com\/xlsx-0\.20\.3/);
  assert.match(report,/XLSX\.writeFile\(wb,fileStem\(\)\+'\.xlsx'/);
  assert.match(report,/unpkg\.com\/jspdf@4\.2\.1/);
  assert.match(report,/doc\.save\(fileStem\(\)\+'\.pdf'/);
});

test("XLSX contains separate reporting sheets",()=>{
  assert.match(report,/add\('Harian'/);
  assert.match(report,/add\('Bulanan'/);
  assert.match(report,/add\('Tahunan'/);
  assert.match(report,/add\('Data Deteni'/);
});

console.log("Data Statistics & Reporting contract PASS");
