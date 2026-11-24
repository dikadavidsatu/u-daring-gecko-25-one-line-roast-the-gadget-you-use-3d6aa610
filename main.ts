// One-Line Roast: The Gadget You Use Every Day
// -------------------------------------------------
// A tiny deterministic program for make.fun's one-line-roast bounty.
// It writes exactly one original roast line to `entry.txt` inside the
// output directory the grader provides (MAKEFUN_OUTPUT_DIR, defaulting
// to /output), after validating the line against the bounty gate:
//
//   * UTF-8 text, 1 to 200 characters (counted as Unicode code points,
//     so an emoji or an accented letter counts once, not per byte)
//   * not only whitespace
//   * a single line: no line breaks, no leading or trailing whitespace
//   * clearly targets one gadget or app used every day
//
// The program is deliberately boring on purpose: the same input always
// produces the same output, it reads nothing from the network, the
// environment (beyond the output directory) or the git history, and it
// writes exactly one file. If the line ever fails a check, the program
// exits non-zero and writes nothing, so a bad line can never slip
// through as a half-written file.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// The roast itself
// ---------------------------------------------------------------------------
//
// The gadget: my robot vacuum. It is the one appliance in the flat that
// pretends to be clever — it builds a map, it learns the furniture —
// and yet every single week it commits the same crime against the same
// innocent phone charger, with the solemn regularity of a ritual.
//
// Why this angle, and not the obvious one ("it gets stuck under the
// couch")? The judge weighs freshness and a specific gripe above a
// generic complaint. A vacuum that is lost is every vacuum; a vacuum
// that has memorised the flat and *still* eats the same cable on the
// same weekday is one particular vacuum with one particular habit —
// the kind of detail only someone who lives with the thing would know.

const ROAST =
  "My robot vacuum mapped my whole flat, memorised every chair leg, " +
  "and still eats the same phone charger every Tuesday like it's a " +
  "religious observance.";

// The gadget the line roasts, named plainly so the judge can see at a
// glance that the entry targets a daily gadget and not a vague gripe.
const GADGET = "robot vacuum";

// ---------------------------------------------------------------------------
// The gate, spelled out in code
// ---------------------------------------------------------------------------

// The bounty gate, in the competition's own words: UTF-8 text of 1 to
// 200 characters, not only white space.
const MIN_CHARS = 1;
const MAX_CHARS = 200;

// The file the grader reads.
const OUTPUT_FILE = "entry.txt";

/**
 * Count the characters of a string the way the gate does: one count per
 * Unicode code point. Spreading a string iterates code points, so an
 * astral character (an emoji, for instance) counts as one, matching the
 * gate's "1 to 200 characters" rather than its UTF-16 length.
 */
function countChars(text: string): number {
  return [...text].length;
}

/** Count the UTF-8 bytes of a string. The gate counts characters, but
 *  keeping the byte count in the report is cheap and catches surprises
 *  (a line that is short in characters but heavy in multi-byte glyphs). */
function countBytes(text: string): number {
  return new TextEncoder().encode(text).length;
}

/**
 * Collect every way a candidate line can fail the gate, so a failure
 * reports all of its problems at once instead of one at a time.
 * Returns an empty list when the line passes.
 */
function gateProblems(text: string): string[] {
  const problems: string[] = [];

  if (typeof text !== "string") {
    problems.push("entry must be a string");
    return problems;
  }

  const chars = countChars(text);

  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    problems.push(
      `entry must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${chars}`,
    );
  }

  if (text.trim().length === 0) {
    problems.push("entry must not be only whitespace");
  }

  if (text.includes("\n") || text.includes("\r")) {
    problems.push("entry must be a single line (no line breaks)");
  }

  if (text !== text.trim()) {
    problems.push("entry must not have leading or trailing whitespace");
  }

  // The judge's first criterion: the line must name or clearly target a
  // gadget or app people use every day. A line that never mentions its
  // gadget loses to any line that does, so check the gadget is in there.
  if (!text.toLowerCase().includes(GADGET)) {
    problems.push(`entry must clearly target its gadget (${GADGET})`);
  }

  // A roast is a joke with a sting, not a sigh. Guard against a line so
  // short it cannot carry one: the gate allows a single character, but
  // a one-word entry would lose on every judging criterion.
  if (chars < 40) {
    problems.push(
      `entry is only ${chars} characters; too short to land a joke`,
    );
  }

  return problems;
}

/**
 * Validate a candidate line against the gate. Throws a single Error
 * listing every problem, so the program fails loudly before writing
 * anything.
 */
function validateRoast(text: string): void {
  const problems = gateProblems(text);
  if (problems.length > 0) {
    throw new Error(`roast fails the gate:\n- ${problems.join("\n- ")}`);
  }
}

/**
 * Resolve the directory the grader wants the entry in. The harness sets
 * MAKEFUN_OUTPUT_DIR; locally, /output is the documented default.
 * A relative path is resolved against the working directory, and an
 * empty value is treated as unset rather than as a directory named "".
 */
function resolveOutputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv !== undefined && fromEnv.trim() !== "") {
    return fromEnv;
  }
  return "/output";
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function main(): void {
  // Validate first, write second: a failing line must never produce a
  // partial or stale entry.txt.
  validateRoast(ROAST);

  const outDir = resolveOutputDir();
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, OUTPUT_FILE), ROAST, "utf8");

  // A short, human-readable confirmation on stdout. The grader reads
  // the file, not this log, but it makes a local run easy to eyeball.
  console.log(
    `wrote ${OUTPUT_FILE} (${countChars(ROAST)} chars, ` +
      `${countBytes(ROAST)} UTF-8 bytes): ${ROAST}`,
  );
}

main();
