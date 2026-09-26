#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL must point to LOCAL PostgreSQL}"
case "$DATABASE_URL" in *supabase.co*|*supabase.com*) echo "Refusing Supabase URL"; exit 2;; esac
node scripts/p9.6-introspect-postgres.mjs
