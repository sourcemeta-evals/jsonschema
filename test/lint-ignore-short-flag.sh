#!/usr/bin/env sh
set -eu

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

cd "$tmpdir"

cat > valid.json <<'JSON'
{ "$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object" }
JSON

mkdir -p bad
cat > bad/invalid.json <<'JSON'
/** comment */
{ "foo": 1 }
JSON

if jsonschema lint bad 2>"$tmpdir/stderr1.txt"; then
  echo "Expected lint to fail on invalid JSON, but it passed" >&2
  exit 1
fi
if grep -q "unexpected error: map::at" "$tmpdir/stderr1.txt"; then
  echo "Saw unexpected error path on invalid JSON without ignore" >&2
  exit 1
fi

if ! jsonschema lint -i bad . 2>"$tmpdir/stderr2.txt"; then
  cat "$tmpdir/stderr2.txt" >&2 || true
  exit 1
fi

if grep -q "unexpected error" "$tmpdir/stderr2.txt"; then
  echo "Unexpected error occurred when using -i ignore" >&2
  cat "$tmpdir/stderr2.txt" >&2 || true
  exit 1
fi
