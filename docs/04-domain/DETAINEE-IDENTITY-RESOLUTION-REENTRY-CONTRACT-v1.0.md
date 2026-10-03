# MTA DETENI — Detainee Identity Resolution & Re-entry Contract v1.0

Status: **DOMAIN CONTRACT — IMPLEMENTATION PHASE 1**

## 1. Canonical model

MTA DETENI separates identity from detention occurrence:

```
NID = who the person is
Episode = a detention occurrence
Identity Resolution = how the system determines whether an arriving person already has a canonical NID
```

The canonical identity rule remains:

```
One Person → One Canonical NID → RAP + PERKES + KAMTIB
```

A person may have multiple detention episodes without receiving another NID.

## 2. Re-entry rule

If a person who previously left the Rudenim returns:

```
existing person
      ↓
identity resolution
      ↓
existing NID confirmed
      ↓
new detention episode
```

The system MUST NOT create a second NID merely because the person has re-entered.

The original NID remains immutable. The year encoded in the NID represents the NID's original issuance/identity year; a later episode has its own admission date/year.

## 3. Identity resolution is not name search

Name alone is never sufficient to automatically bind an arrival to an existing NID.

Candidate resolution MAY use:

- full name;
- date of birth;
- passport number;
- nationality;
- other governed identity evidence added later by contract.

The resolver must preserve the distinction between:

- **candidate discovery** — finding potentially matching existing identities;
- **identity confirmation** — an authorized human confirms the candidate;
- **episode creation** — a new detention occurrence is opened against the confirmed NID.

No automatic identity merge is permitted by this contract.

## 4. Matching evidence

The deterministic resolver uses available fields as evidence.

### Strong evidence

Examples:

- passport + date of birth exact;
- passport + name + nationality exact.

### Probable evidence

Examples:

- name + date of birth + nationality exact, when passport is unavailable.

### Possible evidence

Examples:

- name + one supporting attribute.

### Name-only evidence

Name-only matches are discovery candidates only. They MUST NOT be treated as confirmed identity.

The resolver MAY also surface a conservative near-name candidate when the normalized name differs only by a small edit distance. Near-name evidence remains discovery-only and MUST NOT auto-link an identity.

The exact evidence used for each candidate must be returned as `matchBasis`.

## 5. Candidate result contract

A resolver result contains:

```text
status
query
candidates[]
requiresHumanConfirmation
autoLinked
```

Each candidate contains at minimum:

```text
detaineeId
nid
name
dateOfBirth
passportNumber
nationality
status
confidence
matchBasis[]
```

Rules:

- `autoLinked` is always false in v1.
- An existing NID is never changed.
- The resolver does not mutate the database.
- The resolver does not create an episode.
- A candidate list is evidence for an authorized operator, not a final decision.

## 6. Episode model

Logical model:

```text
PERSON / DETAINEE
    |
    +-- NID (immutable)
    |
    +-- EPISODE 001
    |      admission
    |      placement
    |      movement
    |      leave
    |      closure
    |
    +-- EPISODE 002
           admission
           placement
           movement
           leave
           closure
```

An episode represents one continuous detention occurrence beginning at admission and ending at governed closure.

The episode, not the NID, owns episode-specific operational state such as:

- admission date;
- admission reason/basis;
- current episode status;
- episode placement;
- episode movements;
- episode temporary exits;
- episode closure date/reason.

Historical events must not be reassigned silently between episodes.

## 7. Lifecycle

Target lifecycle:

```
ARRIVAL
  ↓
IDENTITY RESOLUTION
  ↓
NO MATCH ───────────────→ CREATE NEW PERSON/NID
  │
  └─ MATCH CANDIDATE
        ↓
  HUMAN CONFIRMATION
        ↓
  EXISTING NID
        ↓
  CREATE NEW EPISODE
        ↓
  ACTIVE
        ↓
  operational lifecycle
        ↓
  CLOSED
```

The no-match path is the only path that may invoke canonical NID creation.

The existing-match path must reuse the confirmed NID.

## 8. Safety rules

1. Never merge by name alone.
2. Never create a second NID because of re-entry.
3. Never mutate an existing NID.
4. Never overwrite historical episode events.
5. Never silently convert a candidate into a confirmed identity.
6. Never let a resolver write directly to production tables.
7. Every identity confirmation/rejection must be auditable when the mutation boundary is implemented.
8. Ambiguous candidates must remain unresolved until an authorized operator decides.
9. Episode creation must be a separate domain command from identity resolution.
10. RAP, PERKES and KAMTIB continue to reference the same canonical NID.

## 9. Phase 1 implementation boundary

This implementation provides a **deterministic, read-only identity resolver** plus a mandatory identity-integrity precheck at the detainee create/save mutation boundary.

It does NOT yet:

- add database tables;
- migrate production data;
- create episodes in production;
- alter the NID generator;
- alter the NID contract;
- automatically merge identities;
- bypass the canonical create mutation; the Save gate now guards that mutation before INSERT.

This boundary is intentional. The production episode schema must first pass domain/schema reconciliation before a database migration is proposed.

## 10. Future episode schema gate

Before production episode persistence is introduced, the following contract must be approved:

```
episode_id
detainee_id / canonical NID reference
admitted_at
closed_at
episode_status
admission_basis
closure_reason
created_at
updated_at
correlation_id
```

Exact physical schema, constraints, indexes, RLS and migration are **not** defined by this document and must be established through the normal database contract gate.

## 11. Acceptance criteria

Phase 1:

- [x] NID remains canonical and immutable.
- [x] Re-entry concept is explicitly separated from identity.
- [x] Resolver is read-only.
- [x] Name-only candidates cannot auto-link.
- [x] Multi-attribute evidence is returned.
- [x] No second NID generator is introduced.
- [x] No production database mutation is introduced by the resolver itself.
- [x] Detainee create/save is protected by a server-side identity precheck.
- [x] Exact and near-name candidates block new-person creation until operator rejection (`NOT_SAME_PERSON`).
- [x] No-match remains the only automatic path to canonical new-person/NID creation.
- [x] Identity gate decision is included in the mutation audit metadata.

Future gate:

- [ ] Episode logical model approved.
- [ ] Identity confirmation command approved.
- [ ] Episode creation command approved.
- [ ] Production schema reconciliation approved.
- [ ] Migration gate approved.
- [ ] Re-entry E2E certification approved.
