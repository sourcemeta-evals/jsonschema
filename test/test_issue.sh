#!/bin/bash
set -e

./build/dist/bin/jsonschema lint test/fixtures/tsconfig.json -i test/fixtures/tsconfig.json
