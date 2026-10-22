const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const child_process = require('child_process');
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

test('spawn forwards caller options to the child', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-spawn-'));

  try {
    fs.writeFileSync(path.join(directory, 'schema.json'), JSON.stringify({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'string'
    }));

    // The relative path only resolves if `cwd` reached the child
    const result = await spawn([ 'bundle', 'schema.json' ], { cwd: directory });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(JSON.parse(result.stdout).type, 'string');
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('spawn reports no captured output when nothing is piped', async () => {
  const result = await spawn([ '--version' ], { stdio: 'ignore' });
  assert.strictEqual(result.code, 0);
  assert.ok(result.stdout === '' || result.stdout === null || result.stdout === undefined,
    `expected no captured stdout, got ${JSON.stringify(result.stdout)}`);
});

test('the command line entrypoint delegates and forwards the exit status', async () => {
  function run(args) {
    return new Promise((resolve) => {
      const child = child_process.spawn(process.execPath,
        [ path.join(__dirname, 'cli.js'), ...args ], { stdio: [ 'ignore', 'pipe', 'pipe' ] });
      let stdout = '';
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        stdout += data;
      });
      child.on('close', (code) => resolve({ code, stdout }));
    });
  }

  const succeeded = await run([ '--version' ]);
  assert.strictEqual(succeeded.code, 0);
  assert.strictEqual(succeeded.stdout.trim(), packageJson.version);

  const failed = await run([ 'definitely-not-a-command' ]);
  assert.notStrictEqual(failed.code, 0);
});

test('spawn keeps caller options when the arguments are omitted', async () => {
  // `child_process.spawn` turns a null or undefined `args` into an empty list
  // before it treats a non-array as the options object. Refusing the call
  // outright is a stricter contract and stays correct, so only silently
  // dropping the options the caller did supply is a failure here
  for (const omitted of [ undefined, null ]) {
    let result;

    try {
      result = await spawn(omitted, { stdio: 'ignore' });
    } catch (error) {
      continue;
    }

    assert.ok(result.stdout === '' || result.stdout === null || result.stdout === undefined,
      `expected no captured stdout for ${omitted}, got ${JSON.stringify(result.stdout)}`);
    assert.ok(result.stderr === '' || result.stderr === null || result.stderr === undefined,
      `expected no captured stderr for ${omitted}, got ${JSON.stringify(result.stderr)}`);
  }
});
