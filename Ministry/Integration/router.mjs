#!/usr/bin/env node
import fs from "node:fs/promises";
import process from "node:process";

function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : undefined;
}

function fail(msg) {
  console.error(`[ministry-router] ERROR: ${msg}`);
  process.exit(1);
}

const eventName = getArg("--event");
const payloadPath = getArg("--payload");

if (!eventName) fail("Missing required arg: --event <eventName>");
if (!payloadPath) fail("Missing required arg: --payload <pathToEventJson>");

let payloadRaw;
try {
  payloadRaw = await fs.readFile(payloadPath, "utf8");
} catch (e) {
  fail(`Cannot read payload file: ${payloadPath} (${e?.message ?? e})`);
}

let payload;
try {
  payload = JSON.parse(payloadRaw);
} catch (e) {
  fail(`Invalid JSON payload: ${payloadPath} (${e?.message ?? e})`);
}

console.log(`[ministry-router] event=${eventName}`);
console.log(`[ministry-router] payloadKeys=${Object.keys(payload).join(",")}`);

// TODO: route to real handlers once they exist in-repo.
