#!/usr/bin/env sh
set -eu

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

mkdir -p "$tmpdir/.angular"
cat > "$tmpdir/.angular/config.json" <<'EOF'
/** comment **/
{ "x": 1 }
EOF

jsonschema lint "$tmpdir/.angular/config.json" --ignore "$tmpdir/.angular"
