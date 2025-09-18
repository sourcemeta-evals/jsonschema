#!/usr/bin/env sh
set -eu

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

cd "$TMPDIR"
mkdir -p ignored
cat > schema.json <<'JSON'
{ "$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object" }
JSON
echo '{"a":1}' > ignored/sample.json

JSONSCHEMA_BIN="/home/ubuntu/repos/jsonschema/build/dist/bin/jsonschema"
OUTPUT="$("$JSONSCHEMA_BIN" lint -i ignored 2>&1 || true)"

echo "$OUTPUT" | grep -q "unexpected error: map::at" && {
  echo "Found crash string" >&2
  exit 1
}

set +e
"$JSONSCHEMA_BIN" lint -i ignored >/dev/null 2>&1
RC=$?
set -e
[ "$RC" -eq 0 ] || {
  echo "lint exited with $RC" >&2
  exit 1
}

exit 0
