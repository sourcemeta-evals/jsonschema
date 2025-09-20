#!/bin/sh
set -eu

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

mkdir -p "$tmp/ignored"
printf '/** comment **/\n{ "foo": "bar" }\n' > "$tmp/ignored/tsconfig.json"

cat << 'EOF' > "$tmp/schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object"
}
EOF

cd "$tmp"

jsonschema lint -i "$tmp/ignored"
