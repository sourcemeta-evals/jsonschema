#!/usr/bin/env sh
set -eu

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

mkdir -p "$tmpdir/node_modules"
cat > "$tmpdir/node_modules/tsconfig.json" <<'EOF'
/** comment **/
{ "compilerOptions": {} }
EOF

jsonschema lint "$tmpdir/node_modules/tsconfig.json" -i "$tmpdir/node_modules"
