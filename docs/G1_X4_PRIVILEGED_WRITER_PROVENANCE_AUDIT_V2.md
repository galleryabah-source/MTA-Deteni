# G1-X4 Privileged Writer Provenance Audit V2

Date: 2026-10-02

## Objective

Establish which production paths can exercise privileged mutation capability against `mta_detainees`, and ensure no non-canonical caller can execute a privileged writer boundary.

## Production evidence

Project: `tmmhxqgzelgrsrxbbfzh`

Current `public.mta_detainees` privileges:

| Principal | SELECT | INSERT | UPDATE | DELETE |
|---|---:|---:|---:|---:|
| authenticated | YES | NO | NO | NO |
| service_role | YES | YES | YES | YES |
| postgres | YES | YES | YES | YES |

The authenticated DML surface was previously contained by migration `20261002160000_mta_detainee_direct_write_containment_v1`.

`service_role` is non-login and bypasses RLS. `postgres` is login-capable and administrative.

## Canonical service-role writer

The deployed repository/runtime boundary uses `SUPABASE_SERVICE_ROLE_KEY` only in protected server-side paths.

For detainee mutation, `mta-api`:
1. authenticates the user with the anon client;
2. performs application/RBAC/scope authorization;
3. creates the service-role admin client;
4. calls `mta_execute_idempotent_mutation`;
5. the public wrapper is executable by `service_role`, not `authenticated`;
6. `mta_internal.execute_idempotent_mutation` additionally rejects callers unless `current_user`/JWT role is `service_role`;
7. the mutation allowlist includes `mta_detainees`;
8. the mutation writes audit and outbox evidence in the same canonical transaction boundary.

This is the canonical detainee DML path.

## Privileged seam discovered

Production catalog inspection found:

`mta_internal.execute_movement_transaction(...)`

- SECURITY DEFINER: YES
- `service_role` EXECUTE: YES
- `authenticated` EXECUTE: YES before containment
- function directly reads/writes `mta_detainees`, `mta_movements`, and `mta_placements`;
- authorization is based on the supplied `p_actor_user_id`.

The public `mta_execute_movement_transaction` wrapper is service-role-only, but the internal SECURITY DEFINER function itself had an authenticated EXECUTE grant. Because the internal function accepts actor identity as a parameter, direct execution represented an unnecessary privileged writer seam outside the canonical API boundary.

## Containment

PR #300 introduces:

`20261002223000_g1_x4_privileged_movement_execute_containment_v1.sql`

It revokes EXECUTE from:

- PUBLIC
- anon
- authenticated

and grants EXECUTE only to:

- service_role

No application behavior is changed: canonical `mta-api` already uses the service-role wrapper.

## Evidence status

| Control | Status |
|---|---|
| authenticated direct table DML | CONTAINED |
| generic canonical mutation function | service-role-only |
| movement SECURITY DEFINER direct execution | CONTAINMENT PENDING CI/PRODUCTION ROLLOUT |
| service_role credential-to-caller inventory | PARTIAL |
| postgres administrative provenance | UNVERIFIED |
| external service-role clients | UNVERIFIED |
| G1 certification | BLOCKED |

## Safety boundary

Do not revoke `service_role` table DML or administrative `postgres` privileges as part of this gate. They are currently required by the canonical server-side mutation and operational administration paths.

The next closure work is provenance, not indiscriminate privilege removal:
- enumerate all deployed server functions using service-role credentials;
- verify each function's allowed table/routine surface;
- verify no scheduled/external client possesses a service-role credential;
- close administrative writer provenance;
- retain production telemetry evidence for privileged mutation calls.

## Conclusion

G1-X4 has identified and bounded an additional privileged writer seam. The direct authenticated table writer is already contained. PR #300 addresses the remaining authenticated EXECUTE seam for the movement SECURITY DEFINER function.

G1 remains BLOCKED until privileged credential provenance and remaining external/manual/recovery dependencies are closed.
