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
      const line=(pos.line+1);
      const context=source.split("\n").slice(Math.max(0,line-4),line+2).map((x,i)=>String(Math.max(1,line-3+i))+": "+x).join("\n");
      return ts.flattenDiagnosticMessageText(d.messageText," ")+" @ "+line+":"+(pos.character+1)+"\n"+context;
    }).join("\n---\n");
    const top=file.statements.map(n=>{
      const p=file.getLineAndCharacterOfPosition(n.pos);
      return ts.SyntaxKind[n.kind]+" @ "+(p.line+1)+":"+ (p.character+1);
    }).join("\n");
    assert.fail(details+"\nTOP_LEVEL:\n"+top);
  }
});
