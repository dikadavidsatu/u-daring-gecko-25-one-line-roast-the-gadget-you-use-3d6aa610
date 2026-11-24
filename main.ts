// ===========================================================================
// One-Line Roast — the gadget I use every day: my robot vacuum
// ===========================================================================
//
// What this program does, in one sentence: it writes a single original
// roast line about a robot vacuum into `entry.txt` inside the directory
// the grader hands it, after checking that the line satisfies the
// competition's gate.
//
// The competition (make.fun, "One-Line Roast: The Gadget You Use Every
// Day") is judged by a comedy-editor model that compares entries two at
// a time. It cares most about these things, in this order:
//
//   1. The line must roast a gadget or app people actually use daily.
//   2. It must be funny on a first read — a sting of recognition.
//   3. It must feel fresh — an angle nobody else is using.
//   4. It must be neatly worded — tight, no wasted words.
//   5. It must sound like one person's specific gripe, with a concrete
//      detail about how the thing really behaves.
//
// The roast below is built around exactly that ordering. The gadget is
// named in the first three words, so criterion 1 is settled before the
// joke even starts. The joke itself is not the obvious complaint
// ("it gets stuck under the sofa" — every robot vacuum does that, and
// every entrant knows it). It is the opposite: the vacuum is *good* at
// its job. It mapped the whole flat, it memorised where every chair leg
// is, it is, by its own marketing, smart. And yet, with all that
// knowledge, it still eats the same phone charger, on the same weekday,
// with the solemn regularity of a ritual. A machine that learns the
// floor plan and learns nothing from it — that contradiction is the
// sting, and "every Tuesday like it's a religious observance" is the
// concrete, slightly absurd detail that makes it one person's vacuum
// rather than a generic moan about a generic appliance.
//
// The gate, from the competition rules, is small and exact:
//   * the file must be UTF-8 text of 1 to 200 characters
//   * it must not be only whitespace
//   * it must be a single line
// The program enforces all of that itself before writing anything, and
// refuses to write a file at all if any check fails. It never touches
// the network, never reads the environment beyond the output directory,
// and always produces the same bytes — run it twice, get the same file
// twice. That is the whole point: the entry is a fixed, deliberate
// piece of writing, and the program is just the envelope that carries
// it to the grader.
//
// SPDX-License-Identifier: MIT (see LICENSE)

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// The roast
// ---------------------------------------------------------------------------

// The line itself, built from three clauses so each beat of the joke is
// visible in the source. Joined with single spaces; the result is one
// unbroken sentence with no trailing newline in the file.
//
// Clause 1 — the setup: the vacuum is clever, it mapped everything.
// Clause 2 — the turn: "and still" — all that cleverness, wasted.
// Clause 3 — the punchline: the same charger, every Tuesday, like a
//             religious observance. The weekday makes it a habit, the
//             comparison makes it funny.
const ROAST_CLAUSES: readonly string[] = [
  "My robot vacuum mapped my whole flat, memorised every chair leg,",
  "and still eats the same phone charger every Tuesday",
  "like it's a religious observance.",
];

const ROAST: string = ROAST_CLAUSES.join(" ");

// The gadget being roasted, kept as its own constant so the checks below
// can confirm the line actually names it. If the line ever stopped
// mentioning the vacuum, the program should fail rather than submit a
// line the judge would score against on its very first criterion.
const GADGET_NAME = "robot vacuum";

// ---------------------------------------------------------------------------
// The gate — the competition's own limits, as constants
// ---------------------------------------------------------------------------

// Minimum and maximum length of the entry, in characters. The gate
// counts characters, not bytes, so these are compared against a
// code-point count (see countCodePoints below).
const GATE_MIN_LENGTH = 1;
const GATE_MAX_LENGTH = 200;

// A roast needs room to breathe: a line shorter than this could pass
// the gate and still lose on every judging criterion, because a joke
// that short has no setup and no punchline. This floor is stricter than
// the gate on purpose — it is a quality bar, not a legal one.
const MIN_JOKE_LENGTH = 40;

// The name of the file the grader reads inside the output directory.
const ENTRY_FILENAME = "entry.txt";

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

// How long is this string, the way the gate measures it? Spreading a
// string iterates Unicode code points, so an emoji or an accented letter
// counts as one character, not two UTF-16 units and not several bytes.
// The roast is plain ASCII, so every counting method agrees on it — but
// measuring the way the gate measures keeps the check honest even if
// the line ever gains a non-ASCII character.
function countCodePoints(text: string): number {
  return [...text].length;
}

// Byte length of the same string in UTF-8. The gate does not limit
// bytes, but reporting them costs nothing and makes a surprising file
// (a short line that is somehow huge) visible at a glance.
function countUtf8Bytes(text: string): number {
  return new TextEncoder().encode(text).length;
}

// Does the string contain any line break at all — \n, \r, or the pair?
// The entry must be exactly one line, and the grader's gate is a
// single-line text file, so any break is a hard failure.
function hasLineBreak(text: string): boolean {
  return text.includes("\n") || text.includes("\r");
}

// ---------------------------------------------------------------------------
// Validation — every gate rule, checked before any file is written
// ---------------------------------------------------------------------------

// A single failed check, described plainly. The validator collects all
// of them instead of stopping at the first, so one bad run tells you
// everything that is wrong with the line at once.
interface GateFailure {
  rule: string;
  detail: string;
}

// Run every gate check against a candidate line and return the list of
// failures. An empty list means the line passes.
function checkRoast(line: string): GateFailure[] {
  const failures: GateFailure[] = [];

  const length = countCodePoints(line);

  if (length < GATE_MIN_LENGTH || length > GATE_MAX_LENGTH) {
    failures.push({
      rule: "length",
      detail: `entry must be ${GATE_MIN_LENGTH}-${GATE_MAX_LENGTH} characters, got ${length}`,
    });
  }

  if (line.trim().length === 0) {
    failures.push({
      rule: "whitespace-only",
      detail: "entry must contain more than whitespace",
    });
  }

  if (hasLineBreak(line)) {
    failures.push({
      rule: "single-line",
      detail: "entry must be one line with no line breaks",
    });
  }

  if (line !== line.trim()) {
    failures.push({
      rule: "trim",
      detail: "entry must not start or end with whitespace",
    });
  }

  // The judge's first criterion is the gadget itself: a line that never
  // names or clearly targets a daily gadget loses to any line that
  // does. Make sure the gadget's name is actually in the text.
  if (!line.toLowerCase().includes(GADGET_NAME)) {
    failures.push({
      rule: "gadget",
      detail: `entry must clearly target its gadget (${GADGET_NAME})`,
    });
  }

  // The quality floor described above: too short to carry a joke.
  if (length < MIN_JOKE_LENGTH) {
    failures.push({
      rule: "joke-length",
      detail: `entry is only ${length} characters; too short to land a joke`,
    });
  }

  return failures;
}

// Validate, or throw one error that lists every failure. Throwing
// before any write means a bad line can never leave a half-written or
// stale entry.txt behind.
function requireValidRoast(line: string): void {
  const failures = checkRoast(line);
  if (failures.length === 0) {
    return;
  }
  const lines = failures.map((f) => `  - [${f.rule}] ${f.detail}`);
  throw new Error(`roast fails the gate:\n${lines.join("\n")}`);
}

// ---------------------------------------------------------------------------
// Output directory
// ---------------------------------------------------------------------------

// Where does the entry go? The grader sets MAKEFUN_OUTPUT_DIR; when it
// is absent (a local run, or a harness that uses the documented
// default), the entry goes to /output. A value that is only whitespace
// is treated as unset — an empty string is not a directory.
function outputDirectory(): string {
  const fromEnvironment = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnvironment !== undefined && fromEnvironment.trim() !== "") {
    return fromEnvironment;
  }
  return "/output";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  // Validate first, write second. Nothing is created until the line has
  // passed every check, so a failure leaves no file at all.
  requireValidRoast(ROAST);

  const directory = outputDirectory();
  const destination = join(directory, ENTRY_FILENAME);

  mkdirSync(directory, { recursive: true });
  writeFileSync(destination, ROAST, "utf8");

  // A one-line confirmation for a human running this locally. The
  // grader reads the file, never this log — but when you run the
  // program by hand, seeing the character count here is how you know
  // at a glance that the gate passed.
  console.log(
    `wrote ${ENTRY_FILENAME} (${countCodePoints(ROAST)} chars, ` +
      `${countUtf8Bytes(ROAST)} bytes) to ${destination}: ${ROAST}`,
  );
}

main();
