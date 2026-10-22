const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('./main.js');
const packageJson = require('../package.json');

test('spawn returns version with --version flag', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.strictEqual(result.stdout.trim(), packageJson.version);
});

test('spawn returns help with --help flag', async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(result.code, 0);
  assert.match(result.stdout, /Usage:/);
  assert.match(result.stdout, /Commands:/);
});

test('spawn returns non-zero exit code for invalid command', async () => {
  const result = await spawn(['invalid-command']);
  assert.strictEqual(result.code, 1);
});

test('spawn captures stderr on error', async () => {
  const result = await spawn(['validate']);
  assert.strictEqual(result.code, 1);
  assert.ok(result.stderr.length > 0);
});

test('spawn preserves multibyte output that spans stream chunks', async () => {
  // Three-byte characters on purpose: a read boundary cannot stay aligned with
  // them, so an implementation that decodes each chunk on its own corrupts the
  // characters the boundary cuts through. Two-byte characters would leave the
  // boundaries aligned and assert nothing.
  const description = '\u2192'.repeat(120000);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-spawn-'));
  const schema = path.join(directory, 'schema.json');

  try {
    fs.writeFileSync(schema, JSON.stringify({
      $schema: 'http://json-schema.org/draft-07/schema#',
      description: description,
      type: 'string'
    }));

    const result = await spawn(['bundle', schema]);
    assert.strictEqual(result.code, 0);
    assert.strictEqual(JSON.parse(result.stdout).description, description);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
