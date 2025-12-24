#!/bin/sh
set -e
${JSONSCHEMA_CLI} lint ${TEST_DIRECTORY}/pass_ignore_crash.json -i ${TEST_DIRECTORY}/pass_ignore_crash_ignored.json
