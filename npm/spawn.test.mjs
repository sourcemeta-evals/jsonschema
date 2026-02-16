import { describe, it } from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { spawn } = require("./main");

describe("spawn (ESM)", () => {
  it("should export a spawn function", () => {
    assert.strictEqual(typeof spawn, "function");
  });

  it("should return a promise", () => {
    const result = spawn(["--version"]);
    assert.ok(result instanceof Promise);
    result.catch(() => {});
  });

  it("should resolve with stdout, stderr, and code properties", async () => {
    const result = await spawn(["--version"]);
    assert.ok(Object.hasOwn(result, "stdout"));
    assert.ok(Object.hasOwn(result, "stderr"));
    assert.ok(Object.hasOwn(result, "code"));
  });

  it("should resolve with a numeric exit code", async () => {
    const result = await spawn(["--version"]);
    assert.strictEqual(typeof result.code, "number");
  });

  it("should capture stdout as a string", async () => {
    const result = await spawn(["--version"]);
    assert.strictEqual(typeof result.stdout, "string");
  });

  it("should capture stderr as a string", async () => {
    const result = await spawn(["--version"]);
    assert.strictEqual(typeof result.stderr, "string");
  });

  it("should resolve with empty stdout and stderr when stdio is inherit", async () => {
    const result = await spawn(["--version"], { stdio: "inherit" });
    assert.strictEqual(result.stdout, "");
    assert.strictEqual(result.stderr, "");
    assert.strictEqual(typeof result.code, "number");
  });

  it("should pass arguments to the executable", async () => {
    const result = await spawn(["--version"]);
    assert.strictEqual(result.code, 0);
  });

  it("should accept options like child_process.spawn", async () => {
    const result = await spawn(["--version"], { windowsHide: true });
    assert.strictEqual(typeof result.code, "number");
  });
});
