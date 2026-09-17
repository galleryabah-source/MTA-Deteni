# MTA DETENI — Master Room Control Plane v1.0

## Status

Implemented in synthetic/local runtime. This contract is non-authorizing and does not open PostgreSQL, migrations, production access, AI, or real detainee data.

## Core rule

`Master Blok` and `Master Kamar` are authoritative configuration data. Operational modules must reference the registered room rather than accepting arbitrary free-text room values.

```text
Administrator Settings
  ├─ Master Blok
  └─ Master Kamar
       ├─ room_id
       ├─ block_id
       ├─ capacity
       ├─ type
       ├─ category
       ├─ status
       ├─ note
       └─ QR lifecycle
              ↓
       Data Deteni / Penempatan / Pergerakan
              ↓
       current placement
              ↓
       Room Operations (read-only operational view)
```

## Master room attributes

- Block
- Room name/number
- Capacity
- Room type
- Category
- Operational status: `ACTIVE`, `INACTIVE`, `MAINTENANCE`
- Note
- QR state/token metadata
- Version/source metadata in synthetic runtime

## Operational constraints

1. A new detainee selects an active room from the Master Room dropdown.
2. The initial assignment is persisted with `roomId` and compatible block/room projection.
3. Capacity is checked before assignment.
4. Editing an existing detainee does not silently move the detainee. Room changes belong to the Movement/Room Transfer flow.
5. Room Transfer selects a registered active destination room.
6. The current room cannot be selected as the destination.
7. A destination at capacity is disabled/rejected.
8. Transfer creates a movement event and a new placement record.
9. Current occupancy is derived from the latest placement per detainee, not from the full placement history.
10. Room Ops does not create inferred rooms from placement history.
11. Legacy/orphan placement references are surfaced for administrator reconciliation instead of silently creating a room.
12. Room operational status and QR lifecycle state are separate concepts.

## Administrator control plane

The Administrator Settings area is the home for configuration/master data, including:

- System/facility settings
- Master Block
- Master Room
- Duty groups
- Shifts
- Movement types
- Leave types
- Document types
- Document classifications
- Room types
- Room categories
- QR policy visibility
- Security/governance information

Production user/role/permission management remains an authorization-boundary concern. Passwords and secrets are never stored in this preview runtime.

## Runtime adapters

The current Cloudflare static adapter injects the canonical runtime modules in this order:

1. `preview-v5.js`
2. `preview-v6.js`
3. `qr-print-clean-v3.js`
4. `room-ops-v9.js`
5. `movement-v9.js`
6. `admin-settings-v9.js`

`wrangler.toml` uses `run_worker_first = ["/*"]` so HTML passes through the Worker and the injection contract is observable in local/controlled preview.

## PostgreSQL/Supabase migration boundary

The synthetic object model intentionally keeps a compatibility projection (`block`, `room`) for the current preview. The future relational model should use foreign keys:

- `blocks.id`
- `rooms.id -> blocks.id`
- `placements.room_id -> rooms.id`
- `placements.detainee_id -> detainees.id`
- `movements.from_room_id -> rooms.id`
- `movements.to_room_id -> rooms.id`

Free-text room names must not be the authoritative relational key.

## Acceptance checks

- [x] Administrator can register a block.
- [x] Administrator can register a room under a block.
- [x] Administrator can set room capacity/type/category/status.
- [x] Data Detainee initial assignment consumes Master Room.
- [x] Full rooms are blocked for new assignment.
- [x] Existing detainee edit does not silently transfer room.
- [x] Room Transfer consumes Master Room.
- [x] Current room is excluded as destination.
- [x] Full/inactive destination is blocked.
- [x] Room Ops is read-only for master creation.
- [x] Room Ops separates room state from QR state.
- [x] Orphan placement is surfaced instead of creating a room.
- [ ] Controlled-nonprod browser execution evidence after this integration.
- [ ] PostgreSQL/Supabase non-production relational verification after governance clearance.
