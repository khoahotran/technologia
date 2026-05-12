import path from 'path';

export class Config {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.include = options.include || ['src/**', 'app/**', 'packages/**', 'components/**', 'ui/**', 'features/**', 'libs/**'];
    this.exclude = options.exclude || ['node_modules/**', '.next/**', 'dist/**', 'build/**', 'coverage/**', 'generated/**'];
    this.tokenRoots = options.tokenRoots || ['public/globals.css', 'src/styles/**', 'src/theme/**'];
    this.severityOverrides = options.severityOverrides || {};
    this.confidenceThreshold = options.confidenceThreshold || 0.3;
    this.parallel = options.parallel !== false;
    this.cache = options.cache !== false;
    this.outputDir = options.outputDir || 'docs/color-audit';
  }

  static fromFile(configPath) {
    // Logic to load from file if exists
    return new Config();
  }

  isIgnored(filePath) {
    // Simplified glob check for now
    return this.exclude.some(pattern => filePath.includes(pattern.replace('/**', '')));
  }
}
