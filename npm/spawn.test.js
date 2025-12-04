const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');

const { spawn, getExecutablePath, PLATFORM, ARCH, EXECUTABLE } = require('./main.js');

test('CommonJS: exports are defined', async (t) => {
  await t.test('spawn function is exported', () => {
    assert.strictEqual(typeof spawn, 'function');
  });

  await t.test('getExecutablePath function is exported', () => {
    assert.strictEqual(typeof getExecutablePath, 'function');
  });

  await t.test('PLATFORM is exported', () => {
    assert.strictEqual(typeof PLATFORM, 'string');
  });

  await t.test('ARCH is exported', () => {
    assert.strictEqual(typeof ARCH, 'string');
  });

  await t.test('EXECUTABLE is exported', () => {
    assert.strictEqual(typeof EXECUTABLE, 'string');
  });
});

test('CommonJS: platform detection', async (t) => {
  await t.test('PLATFORM is valid', () => {
    const validPlatforms = ['darwin', 'linux', 'windows'];
    assert.ok(validPlatforms.includes(PLATFORM), `PLATFORM should be one of ${validPlatforms.join(', ')}`);
  });

  await t.test('ARCH is valid', () => {
    const validArchs = ['x86_64', 'arm64'];
    assert.ok(validArchs.includes(ARCH), `ARCH should be one of ${validArchs.join(', ')}`);
  });
});

test('CommonJS: getExecutablePath returns correct path', () => {
  const execPath = getExecutablePath();
  assert.strictEqual(execPath, EXECUTABLE);
  assert.ok(execPath.includes('build'));
  assert.ok(execPath.includes('github-releases'));
  assert.ok(execPath.includes('jsonschema'));
});

test('CommonJS: spawn returns a promise', async () => {
  const result = spawn(['--help']);
  assert.ok(result instanceof Promise);
  try {
    await result;
  } catch {
    // Expected if executable doesn't exist
  }
});

test('CommonJS: spawn with --help returns version info', async () => {
  const execPath = getExecutablePath();
  if (!fs.existsSync(execPath)) {
    return;
  }

  const result = await spawn(['--help']);
  assert.strictEqual(typeof result.code, 'number');
  assert.strictEqual(typeof result.stdout, 'string');
  assert.strictEqual(typeof result.stderr, 'string');
});

test('CommonJS: spawn with invalid args returns non-zero exit code', async () => {
  const execPath = getExecutablePath();
  if (!fs.existsSync(execPath)) {
    return;
  }

  const result = await spawn(['--invalid-flag-that-does-not-exist']);
  assert.notStrictEqual(result.code, 0);
});

test('CommonJS: spawn with stdio inherit returns empty stdout/stderr', async () => {
  const execPath = getExecutablePath();
  if (!fs.existsSync(execPath)) {
    return;
  }

  const result = await spawn(['--help'], { stdio: 'inherit' });
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
});
