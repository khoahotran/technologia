import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class Cache {
  constructor(rootDir) {
    this.cacheDir = path.join(rootDir, '.color-audit');
    this.cacheFile = path.join(this.cacheDir, 'cache.json');
    this.data = this.load();
  }

  load() {
    if (fs.existsSync(this.cacheFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.cacheFile, 'utf-8'));
      } catch (e) {
        return { hashes: {}, results: {} };
      }
    }
    return { hashes: {}, results: {} };
  }

  save() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    fs.writeFileSync(this.cacheFile, JSON.stringify(this.data, null, 2));
  }

  getFileHash(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  }

  getValidResult(filePath) {
    const currentHash = this.getFileHash(filePath);
    if (this.data.hashes[filePath] === currentHash) {
      return this.data.results[filePath];
    }
    return null;
  }

  setResult(filePath, result) {
    const currentHash = this.getFileHash(filePath);
    this.data.hashes[filePath] = currentHash;
    this.data.results[filePath] = result;
  }
}
