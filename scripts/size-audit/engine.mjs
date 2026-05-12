import glob from 'fast-glob';
import { SizeBabelParser } from './parsers/SizeBabelParser.mjs';
import { SizePostCSSParser } from './parsers/SizePostCSSParser.mjs';
import { SizingAnalyzer } from './analyzers/SizingAnalyzer.mjs';

export class SizeAuditEngine {
  constructor(options = {}) {
    this.obs = {
      log: (msg) => console.log(`[INFO] ${msg}`),
      error: (msg, err) => console.error(`[ERROR] ${msg}`, err)
    };
    this.babelParser = new SizeBabelParser(this.obs);
    this.postcssParser = new SizePostCSSParser(this.obs);
    this.analyzer = new SizingAnalyzer();
    
    this.config = {
      include: ['src/**/*.{tsx,jsx,ts,js}', 'public/**/*.css'],
      exclude: ['node_modules/**', '.next/**', 'dist/**'],
      outputDir: 'docs/size-audit'
    };
  }

  async run() {
    this.obs.log('Starting Sizing Audit...');
    const files = await glob(this.config.include, { ignore: this.config.exclude });
    this.obs.log(`Scanning ${files.length} files...`);

    const allFindings = [];

    for (const file of files) {
      let findings = [];
      if (file.endsWith('.css') || file.endsWith('.scss')) {
        findings = await this.postcssParser.parse(file);
      } else {
        findings = await this.babelParser.parse(file);
      }
      allFindings.push(...findings);
    }

    const issues = this.analyzer.analyze(allFindings);
    
    const stats = this.calculateStats(allFindings, issues);

    return {
      findings: allFindings,
      issues,
      stats
    };
  }

  calculateStats(findings, issues) {
    const totalUsages = findings.length;
    const arbitraryUsages = issues.filter(i => i.ruleId === 'SZ001').length;
    
    // Group unique sizes
    const uniqueSizes = new Set(findings.map(f => f.token).filter(Boolean));
    const uniqueSpacing = new Set(findings.filter(f => f.type === 'spacing').map(f => f.token));
    const uniqueTypography = new Set(findings.filter(f => f.type === 'typography').map(f => f.token));

    return {
      totalUsages,
      arbitraryUsages,
      adoptionRate: totalUsages > 0 ? ((totalUsages - arbitraryUsages) / totalUsages) * 100 : 100,
      uniqueSizeCount: uniqueSizes.size,
      uniqueSpacingCount: uniqueSpacing.size,
      uniqueTypographyCount: uniqueTypography.size
    };
  }
}
