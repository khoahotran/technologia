const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');
const srcDir = path.join(__dirname, '../src');

// 1. Load keys from JSON files
function loadKeys(lang) {
  try {
    const content = fs.readFileSync(path.join(localesDir, `${lang}.json`), 'utf-8');
    const json = JSON.parse(content);
    return new Set(Object.keys(json));
  } catch (e) {
    console.error(`Could not load ${lang}.json:`, e.message);
    return new Set();
  }
}

const viKeys = loadKeys('vi');
const enKeys = loadKeys('en');

// 2. Find all used keys in .ts and .tsx files
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const allTsFiles = getAllFiles(srcDir);
const usedKeys = new Set();
const keyUsage = {}; // key -> Set of files

// Matches t("some_key") or t('some_key') or t(`some_key`)
const tRegex = /\bt\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]/g;

allTsFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    const key = match[1];
    usedKeys.add(key);
    if (!keyUsage[key]) {
      keyUsage[key] = new Set();
    }
    const relativePath = path.relative(path.join(__dirname, '..'), file);
    keyUsage[key].add(relativePath);
  }
});

// 3. Compare and report
let hasMissing = false;
const missingInVi = [];
const missingInEn = [];

usedKeys.forEach(key => {
  // We ignore dynamic keys if they are not literal strings (but our regex only captures literal strings)
  if (!viKeys.has(key)) missingInVi.push(key);
  if (!enKeys.has(key)) missingInEn.push(key);
});

console.log(`\n🔍 Found ${usedKeys.size} unique translation keys used in source files.\n`);

if (missingInVi.length === 0 && missingInEn.length === 0) {
  console.log("✅ All used translation keys exist in both vi.json and en.json!");
} else {
  if (missingInVi.length > 0) {
    console.log(`❌ Missing in vi.json (${missingInVi.length}):`);
    missingInVi.forEach(key => {
      console.log(`  - "${key}" (Used in: ${Array.from(keyUsage[key]).join(', ')})`);
    });
    hasMissing = true;
  }

  if (missingInEn.length > 0) {
    console.log(`\n❌ Missing in en.json (${missingInEn.length}):`);
    missingInEn.forEach(key => {
      console.log(`  - "${key}" (Used in: ${Array.from(keyUsage[key]).join(', ')})`);
    });
    hasMissing = true;
  }
}

// 4. Check for unused keys (optional but helpful)
const unusedInVi = [];
viKeys.forEach(key => {
  if (!usedKeys.has(key)) unusedInVi.push(key);
});
if (unusedInVi.length > 0) {
  console.log(`\n⚠️ Warning: Found ${unusedInVi.length} keys in vi.json that are NOT directly used with t("key") in any .ts/.tsx file.`);
  console.log(`   (Note: Some keys might be used dynamically or in other ways like formatOrderStatusLabel)`);
}

if (hasMissing) {
  process.exit(1);
} else {
  process.exit(0);
}
