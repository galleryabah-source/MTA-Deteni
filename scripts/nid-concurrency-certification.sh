#!/usr/bin/env bash
set -euo pipefail

: "${PGHOST:=127.0.0.1}"
: "${PGPORT:=5432}"
: "${PGUSER:=postgres}"
: "${PGPASSWORD:=postgres}"
: "${PGDATABASE:=postgres}"

psql=(psql -v ON_ERROR_STOP=1)
"${psql[@]}" -f test/fixtures/nid-concurrency-certification.sql

workers=32
rows_per_worker=10
pids=()

for worker in $(seq 1 "$workers"); do
  (
    for row in $(seq 1 "$rows_per_worker"); do
      PGPASSWORD="$PGPASSWORD" psql -X -q -v ON_ERROR_STOP=1         -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE"         -c "insert into nid_cert.mta_detainees(entry_year) values (2026);"
    done
  ) &
  pids+=("$!")
done

for pid in "${pids[@]}"; do wait "$pid"; done

expected=$((workers*rows_per_worker))
actual=$(PGPASSWORD="$PGPASSWORD" psql -X -At -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "select count(*) from nid_cert.mta_detainees")
distinct_count=$(PGPASSWORD="$PGPASSWORD" psql -X -At -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "select count(distinct nid) from nid_cert.mta_detainees")
malformed=$(PGPASSWORD="$PGPASSWORD" psql -X -At -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "select count(*) from nid_cert.mta_detainees where nid !~ '^RDM-PTK-[0-9]{2}-[0-9]{6}$'")
sequence_last=$(PGPASSWORD="$PGPASSWORD" psql -X -At -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "select last_value from nid_cert.mta_detainee_nid_seq")
duplicates=$(PGPASSWORD="$PGPASSWORD" psql -X -At -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "select count(*) from (select nid from nid_cert.mta_detainees group by nid having count(*) > 1) d")

test "$actual" = "$expected"
test "$distinct_count" = "$expected"
test "$malformed" = "0"
test "$sequence_last" = "$expected"
test "$duplicates" = "0"

mkdir -p artifacts/mta-evidence
node - <<NODE
const fs=require('fs');
const evidence={
  certification:"NID-CONCURRENCY-CERTIFICATION",
  status:"PASS",
  environment:"controlled-nonprod",
  syntheticOnly:true,
  productionAccessAuthorized:false,
  workers:$workers,
  rowsPerWorker:$rows_per_worker,
  expectedRows:$expected,
  actualRows:Number("$actual"),
  distinctNids:Number("$distinct_count"),
  malformedNids:Number("$malformed"),
  duplicateNidGroups:Number("$duplicates"),
  sequenceLastValue:Number("$sequence_last"),
  controls:{
    "NID-TEST-005":"PASS",
    "NID-TEST-006":"PASS",
    "NID-TEST-007":"PASS"
  }
};
fs.writeFileSync("artifacts/mta-evidence/nid-concurrency-certification.json",JSON.stringify(evidence,null,2)+"\n");
NODE

echo "NID-CONCURRENCY-CERTIFICATION=PASS"
