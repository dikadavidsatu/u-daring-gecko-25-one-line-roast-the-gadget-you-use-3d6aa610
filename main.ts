import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "My wireless earbuds know my taste in podcasts perfectly, yet the left one dies at 47% every time, leaving the right to finish true-crime episodes as a lone, terrified witness.";

function validate(text: string): void {
  if (typeof text !== "string") throw new Error("entry must be a string");
  const chars = [...text];
  if (chars.length < 1 || chars.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${chars.length}`);
  }
  if (text.trim().length === 0) throw new Error("entry must not be only whitespace");
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text !== text.trim()) {
    throw new Error("entry must not have leading or trailing whitespace");
  }
  if (!/earbuds/i.test(text)) {
    throw new Error("entry must clearly target the daily gadget it roasts");
  }
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > 200) {
    throw new Error(`entry must fit the gate in UTF-8 bytes too, got ${bytes.length}`);
  }
}

validate(LINE);

const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "entry.txt"), LINE, "utf8");
