import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

test("runtime TypeScript parser diagnostics are empty",()=>{
  const source=fs.readFileSync("web/mta-app-runtime-full.js","utf8");
  const file=ts.createSourceFile("web/mta-app-runtime-full.js",source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  const diagnostics=file.parseDiagnostics||[];
  if(diagnostics.length){
    const details=diagnostics.map(d=>{
      const pos=file.getLineAndCharacterOfPosition(d.start??0);
      return ts.flattenDiagnosticMessageText(d.messageText," ")+" @ "+(pos.line+1)+":"+(pos.character+1);
    }).join("\n");
    assert.fail(details);
  }
});
