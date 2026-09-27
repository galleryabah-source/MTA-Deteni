# P9.6 Local PostgreSQL

Disposable local replay target for P9.6 schema reconciliation.

- PostgreSQL binds to localhost port 55432.
- No Supabase URL or credentials are used.
- Repository migrations are replayed into a disposable local database.
- Introspection is read-only.
- No production migration is executed.
- The compatibility SQL emulates only the minimum auth/storage objects and the pre-existing role-helper baseline required by the repository migration sequence.

CI is the authoritative controlled evidence path.
