import { describe, it } from "node:test";
import assert from "node:assert";
import path from "path";
import fs from "fs";
import os from "os";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { spawn } = require("./main.js");

describe("spawn ESM", () => {
  it("should export a spawn function", () => {
    assert.strictEqual(typeof spawn, "function");
  });

  it("should return a promise", () => {
    const result = spawn(["--version"]);
    assert.ok(result instanceof Promise);
    result.catch(() => {});
  });

  it("should reject if the executable does not exist", async () => {
    const PLATFORM = os.platform() === "win32" ? "windows" : os.platform();
    const ARCH = os.arch() === "x64" ? "x86_64" : os.arch();
    const dirname = path.dirname(new URL(import.meta.url).pathname);
    const EXECUTABLE =
      PLATFORM === "windows"
        ? path.join(
            dirname,
            "..",
            "build",
            "github-releases",
            `jsonschema-${PLATFORM}-${ARCH}.exe`
          )
        : path.join(
            dirname,
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
    const PLATFORM = os.platform() === "win32" ? "windows" : os.platform();
    const ARCH = os.arch() === "x64" ? "x86_64" : os.arch();
    const dirname = path.dirname(new URL(import.meta.url).pathname);
    const EXECUTABLE =
      PLATFORM === "windows"
        ? path.join(
            dirname,
            "..",
            "build",
            "github-releases",
            `jsonschema-${PLATFORM}-${ARCH}.exe`
          )
        : path.join(
            dirname,
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
