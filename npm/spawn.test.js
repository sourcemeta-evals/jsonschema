const { describe, it } = require("node:test");
const assert = require("node:assert");
const path = require("path");
const fs = require("fs");
const { spawn } = require("./main.js");

describe("spawn CommonJS", () => {
  it("should export a spawn function", () => {
    assert.strictEqual(typeof spawn, "function");
  });

  it("should return a promise", () => {
    const result = spawn(["--version"]);
    assert.ok(result instanceof Promise);
    result.catch(() => {});
  });

  it("should reject if the executable does not exist", async () => {
    const os = require("os");
    const PLATFORM = os.platform() === "win32" ? "windows" : os.platform();
    const ARCH = os.arch() === "x64" ? "x86_64" : os.arch();
    const EXECUTABLE =
      PLATFORM === "windows"
        ? path.join(
            __dirname,
            "..",
            "build",
            "github-releases",
            `jsonschema-${PLATFORM}-${ARCH}.exe`
          )
        : path.join(
            __dirname,
            "..",
            "build",
            "github-releases",
            `jsonschema-${PLATFORM}-${ARCH}`
          );

    if (!fs.existsSync(EXECUTABLE)) {
      await assert.rejects(() => spawn(["--version"]), {
        message: /does not support/,
      });
    }
  });

  it("should reject with a message mentioning GitHub", async () => {
    const os = require("os");
    const PLATFORM = os.platform() === "win32" ? "windows" : os.platform();
    const ARCH = os.arch() === "x64" ? "x86_64" : os.arch();
    const EXECUTABLE =
      PLATFORM === "windows"
        ? path.join(
            __dirname,
            "..",
            "build",
            "github-releases",
            `jsonschema-${PLATFORM}-${ARCH}.exe`
          )
        : path.join(
            __dirname,
            "..",
            "build",
            "github-releases",
            `jsonschema-${PLATFORM}-${ARCH}`
          );

    if (!fs.existsSync(EXECUTABLE)) {
      await assert.rejects(() => spawn(["--version"]), {
        message: /github\.com\/sourcemeta\/jsonschema/,
      });
    }
  });

  it("should accept options as the second argument", () => {
    const result = spawn(["--version"], { stdio: "pipe" });
    assert.ok(result instanceof Promise);
    result.catch(() => {});
  });

  it("should accept empty arguments", () => {
    const result = spawn([], { stdio: "pipe" });
    assert.ok(result instanceof Promise);
    result.catch(() => {});
  });

  it("should accept no arguments", () => {
    const result = spawn();
    assert.ok(result instanceof Promise);
    result.catch(() => {});
  });
});
