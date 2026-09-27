export const uniqueLower = (values) => [...new Set(values.map((value) => value.toLowerCase()))].sort();

export function deriveEffectivePolicies(sql) {
  const events = [];
  const pattern = /(?:drop\s+policy\s+if\s+exists\s+([a-z0-9_]+)|create\s+policy\s+([a-z0-9_]+))/gi;
  for (const match of sql.matchAll(pattern)) {
    events.push({
      index: match.index ?? 0,
      action: match[1] ? "drop" : "create",
      name: (match[1] ?? match[2]).toLowerCase(),
    });
  }
  const active = new Set();
  for (const event of events.sort((a, b) => a.index - b.index)) {
    if (event.action === "drop") active.delete(event.name);
    else active.add(event.name);
  }
  return [...active].sort();
}

export function buildReconciliationRows(expected, actual, type, options = {}) {
  const expectedSet = new Set(uniqueLower(expected));
  const actualSet = new Set(uniqueLower(actual));
  const justifiedActual = new Set(uniqueLower(options.justifiedActual ?? []));
  const all = uniqueLower([...expectedSet, ...actualSet]);
  return all.map((object) => {
    const isExpected = expectedSet.has(object);
    const isActual = actualSet.has(object);
    const isJustified = isActual && !isExpected && justifiedActual.has(object);
    return {
      object_type: type,
      object,
      expected: isExpected,
      actual: isActual,
      status: isExpected && isActual ? "MATCH" : isExpected ? "MISSING" : isJustified ? "MATCH" : "EXTRA",
      ...(isJustified ? { justification: options.justification ?? "actual-object-backed-by-approved-database-constraint" } : {}),
    };
  });
}

export function summarize(rows) {
  return Object.fromEntries(
    [...new Set(rows.map((row) => row.object_type))].map((type) => {
      const scoped = rows.filter((row) => row.object_type === type);
      return [type, {
        total: scoped.length,
        match: scoped.filter((row) => row.status === "MATCH").length,
        missing: scoped.filter((row) => row.status === "MISSING").length,
        extra: scoped.filter((row) => row.status === "EXTRA").length,
        conflict: scoped.filter((row) => row.status === "CONFLICT").length,
        unsafe: scoped.filter((row) => row.status === "UNSAFE").length,
        unknown: scoped.filter((row) => row.status === "UNKNOWN").length,
      }];
    }),
  );
}
