# P9.6 Local PostgreSQL

This environment is an isolated local replay target for P9.6 schema reconciliation.

## Safety

- PostgreSQL binds to localhost port 55432.
- No Supabase URL or credentials are used.
- Repository migrations are replayed into a disposable local database.
- Introspection is read-only.
- No production migration is executed.
- The compatibility SQL only emulates the minimum `auth` and `storage` objects required for repository migration replay.

## Start

From repository root:

```bash
docker compose -f p9.6/docker-compose.yml up -d
```

Wait until healthy, then:

```export DATABASE_URL='postgresql://mta_p96:mta_p96_local_only@localhost:55432/mta_deteni_p96'
bash scripts/p9.6-run-introspection.sh
node scripts/p9.6-build-table-matrix.mjs
```

## Stop/reset

```docker compose -f p9.6/docker-compose.yml down -v```

The `-v` option intentionally destroys only the local P9.6 database volume.
