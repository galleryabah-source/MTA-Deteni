# Legacy Detainee Code Write Boundary V1

## Purpose

Establish the first safe write boundary for legacy detainee `code` without inventing or replacing the unknown legacy code-generation mechanism.

## Decision

Existing `code` values are now treated as **immutable compatibility references after creation**.

The creation path remains compatibility-enabled because the repository evidence does not yet establish a canonical legacy-code generator.

Therefore:

```
CREATE code = compatibility dependency (temporary)
UPDATE code = DENY
NID = canonical operational identity
```

## Implemented boundary

1. Domain update rejects a caller-supplied code that differs from the stored code with `DETAINEE_CODE_IMMUTABLE`.
2. Domain update preserves the existing code instead of treating it as mutable business input.
3. Production adapter does not send code in normal PATCH payloads.
4. Production adapter detects a conflicting caller code and denies it.
5. Main UI edit flow no longer submits code to the update command.
6. Generic detainee API PATCH rejects a caller-supplied `code`.
7. Creation compatibility remains unchanged.
8. No database migration is included.
9. No production data is mutated.
10. No legacy code generator is introduced.

## Why creation remains open

The current repository evidence proves that the legacy field is required by the existing creation contract, but does not establish a single authoritative generator for that value.

Creating a new generator at this stage would create an additional identity-generation seam, which conflicts with the canonical identity model.

The next audit must therefore identify the provenance of new legacy-code values before creation is removed or replaced.

## Retirement state

```
Existing code mutation     = CLOSED
New code consumer          = GUARDED
New code creation          = TEMPORARY COMPATIBILITY
External dependency        = UNPROVEN
Physical retirement        = BLOCKED
```

## Next gate

**Legacy Code Creation Provenance Audit**

Required evidence:

- identify the actual source of every new `code` value;
- determine whether creation is user-entered, imported, generated, or restored;
- identify all production and external callers;
- define the compatibility replacement;
- then remove `code` from the normal create contract.

No column drop is part of that gate.
