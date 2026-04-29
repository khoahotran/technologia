/* global console */

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const LOCALE_DIR = path.join(process.cwd(), "src", "locales");
const SRC_DIR = path.join(process.cwd(), "src");

const KEYWORD_ALLOWLIST = new Set([
  "email",
  "about_email_placeholder",
  "register_email_placeholder",
  "sku",
  "cat_laptop",
]);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

function collectFiles(dirPath, extensions, out = []) {
  for (const entry of readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectFiles(fullPath, extensions, out);
      continue;
    }

    if (extensions.some((ext) => fullPath.endsWith(ext))) {
      out.push(fullPath);
    }
  }
  return out;
}

function extractTranslationKeys(content) {
  const keySet = new Set();
  const regex = /\bt\(\s*["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    keySet.add(match[1]);
  }
  return keySet;
}

function toSortedArray(iterable) {
  return [...iterable].sort((a, b) => a.localeCompare(b));
}

function printSection(title, keys) {
  if (keys.length === 0) return;
  console.log(`\n${title} (${keys.length})`);
  for (const key of keys) {
    console.log(`- ${key}`);
  }
}

const en = readJson(path.join(LOCALE_DIR, "en.json"));
const vi = readJson(path.join(LOCALE_DIR, "vi.json"));

const enKeys = new Set(Object.keys(en));
const viKeys = new Set(Object.keys(vi));

const missingInVi = toSortedArray([...enKeys].filter((key) => !viKeys.has(key)));
const missingInEn = toSortedArray([...viKeys].filter((key) => !enKeys.has(key)));

const sourceFiles = collectFiles(SRC_DIR, [".ts", ".tsx"]);
const usedKeys = new Set();
for (const file of sourceFiles) {
  const content = readFileSync(file, "utf-8");
  for (const key of extractTranslationKeys(content)) {
    usedKeys.add(key);
  }
}

const usedMissingInEn = toSortedArray([...usedKeys].filter((key) => !enKeys.has(key)));
const usedMissingInVi = toSortedArray([...usedKeys].filter((key) => !viKeys.has(key)));

const sameValueKeys = toSortedArray(
  [...enKeys].filter(
    (key) =>
      viKeys.has(key) &&
      en[key] === vi[key] &&
      !KEYWORD_ALLOWLIST.has(key)
  )
);

const hasErrors =
  missingInVi.length > 0 ||
  missingInEn.length > 0 ||
  usedMissingInEn.length > 0 ||
  usedMissingInVi.length > 0 ||
  sameValueKeys.length > 0;

if (!hasErrors) {
  console.log(
    `i18n check passed: en=${enKeys.size}, vi=${viKeys.size}, used=${usedKeys.size}`
  );
  process.exit(0);
}

printSection("Missing keys in vi.json", missingInVi);
printSection("Missing keys in en.json", missingInEn);
printSection("Used keys missing in en.json", usedMissingInEn);
printSection("Used keys missing in vi.json", usedMissingInVi);
printSection("Same value in en/vi (not allowlisted)", sameValueKeys);

process.exit(1);
