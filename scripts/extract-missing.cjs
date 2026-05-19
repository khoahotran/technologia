const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');
const srcDir = path.join(__dirname, '../src');

function loadKeys(lang) {
  try {
    const content = fs.readFileSync(path.join(localesDir, `${lang}.json`), 'utf-8');
    const json = JSON.parse(content);
    return new Set(Object.keys(json));
  } catch (e) {
    return new Set();
  }
}

const viKeys = loadKeys('vi');
const enKeys = loadKeys('en');

function getAllFiles(dirPath, arrayOfFiles = []) {
  fs.readdirSync(dirPath).forEach(file => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });
  return arrayOfFiles;
}

const allTsFiles = getAllFiles(srcDir);
const usedKeys = new Set();
const tRegex = /\bt\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]/g;

allTsFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    usedKeys.add(match[1]);
  }
});

const missing = Array.from(usedKeys).filter(k => !viKeys.has(k) || !enKeys.has(k));
fs.writeFileSync(path.join(__dirname, 'missing-keys.json'), JSON.stringify(missing, null, 2));
console.log(`Saved ${missing.length} missing keys to missing-keys.json`);
