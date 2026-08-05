#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# File A sorts before file B lexicographically, so it is processed first by
# `lint --fix`. If a solution guards the file-write with `return` (rather than
# `continue`) after detecting no rule fired on file A, file B never gets its
# fix applied and the second diff below catches the regression.

cat << 'EOF' > "$TMP/a_no_reformat.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

cat << 'EOF' > "$TMP/b_fixable.json"
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "type": "string",
  "const": "foo",
  "title": "I should not be moved up"
}
EOF

"$1" lint "$TMP/a_no_reformat.json" "$TMP/b_fixable.json" --fix \
  > "$TMP/stdout.txt" 2> "$TMP/stderr.txt"

# The default (non-verbose) invocation must not emit any new stdout or stderr
# output. The fix is scoped to file-write suppression, so it should not
# broaden the CLI's observable output in any way.
test ! -s "$TMP/stdout.txt"
test ! -s "$TMP/stderr.txt"

# File A has no applicable lint rule, so it must be left byte-for-byte intact.
cat << 'EOF' > "$TMP/a_expected.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

diff "$TMP/a_no_reformat.json" "$TMP/a_expected.json"

# File B triggers the `const_with_type` lint rule, so it must be rewritten
# with the `type` keyword removed.
cat << 'EOF' > "$TMP/b_expected.json"
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "const": "foo",
  "title": "I should not be moved up"
}
EOF

diff "$TMP/b_fixable.json" "$TMP/b_expected.json"
