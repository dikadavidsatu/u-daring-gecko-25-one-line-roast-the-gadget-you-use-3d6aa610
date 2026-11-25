// One-Line Roast: The Gadget You Use Every Day
// Writes a single original roast line to the entry file the grader reads.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "My smartwatch counts my steps, tracks my sleep and monitors my heart — yet its own battery gives up by dinner, so the only vital sign it ever reports is its own.";

const MAX_CHARS = 200;

function validate(line: string): void {
  if (line.trim().length === 0) {
    throw new Error("entry line must not be blank");
  }
  if (line.includes("\n")) {
    throw new Error("entry must be exactly one line");
  }
  if (line.length > MAX_CHARS) {
    throw new Error(
      `entry line is ${line.length} characters, over the ${MAX_CHARS}-character gate`,
    );
  }
}

function main(): void {
  validate(LINE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), LINE + "\n", "utf8");
}

main();
