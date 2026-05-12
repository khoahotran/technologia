import path from 'path';
import fg from 'fast-glob';
import fs from 'fs';
import { Config } from './core/Config.mjs';
import { Observability } from './core/Observability.mjs';
import { Cache } from './core/Cache.mjs';
import { TokenResolver } from './resolvers/TokenResolver.mjs';
import { PostCSSParser } from './parsers/PostCSSParser.mjs';
import { BabelParser } from './parsers/BabelParser.mjs';
import { CA001 } from './rules/CA001_HardcodedColor.mjs';
import { SimilarityAnalyzer } from './analyzers/SimilarityAnalyzer.mjs';
import { MigrationAnalyzer } from './analyzers/MigrationAnalyzer.mjs';

export class AuditEngine {
  constructor(options = {}) {
    this.config = new Config(options);
    this.obs = new Observability(options);
    this.cache = this.config.cache ? new Cache(this.config.rootDir) : null;
    this.resolver = new TokenResolver(this.obs);
    this.similarity = new SimilarityAnalyzer(0.05); // 5% DeltaE threshold
    this.migration = new MigrationAnalyzer(this.resolver, this.similarity);
    this.parsers = {
      css: new PostCSSParser(this.resolver, this.obs),
      js: new BabelParser(this.resolver, this.obs)
    };
    this.rules = [CA001];
    this.findings = [];
    this.issues = [];
  }

  async run() {
    this.obs.log('Starting Color Audit...');

    // 1. Resolve Tokens First (Theme discovery)
    const tokenFiles = await fg(this.config.tokenRoots, { cwd: this.config.rootDir, absolute: true });
    for (const file of tokenFiles) {
      if (file.endsWith('.css') || file.endsWith('.scss')) {
        await this.parsers.css.parse(file);
      }
    }

    // 2. Scan all project files
    const files = await fg(this.config.include, { 
      cwd: this.config.rootDir, 
      ignore: this.config.exclude,
      absolute: true 
    });

    this.obs.log(`Scanning ${files.length} files...`);

    for (const file of files) {
      try {
        let fileFindings = null;
        if (this.cache) {
          fileFindings = this.cache.getValidResult(file);
        }

        if (!fileFindings) {
          if (file.endsWith('.css') || file.endsWith('.scss')) {
            fileFindings = await this.parsers.css.parse(file);
          } else if (file.match(/\.(tsx|jsx|ts|js)$/)) {
            fileFindings = await this.parsers.js.parse(file);
          }
          
          if (this.cache && fileFindings) {
            this.cache.setResult(file, fileFindings);
          }
        }

        if (fileFindings) {
          this.findings.push(...fileFindings);
          this.runRules(fileFindings);
        }
      } catch (e) {
        this.obs.error(`Error processing ${file}`, e);
      }
    }

    if (this.cache) this.cache.save();

    const rawColors = this.findings.map(f => {
      if (f.token && f.token.startsWith('[') && f.token.endsWith(']')) {
        return f.token.slice(1, -1);
      }
      return f.rawValue;
    }).filter(c => /^#|^rgb|^hsl/.test(c));

    const similarCandidates = this.similarity.analyze(rawColors);
    const recommendations = this.migration.analyze(this.issues);

    return {
      findings: this.findings,
      issues: this.issues,
      similarCandidates,
      recommendations,
      cycles: this.resolver.cycles,
      stats: this.calculateStats()
    };
  }

  runRules(findings) {
    findings.forEach(finding => {
      this.rules.forEach(rule => {
        const result = rule.check(finding, this.resolver);
        if (result.issue) {
          this.issues.push({
            ...finding,
            ruleId: rule.id,
            severity: rule.severity,
            message: result.message,
            hint: result.hint,
            confidence: result.confidence
          });
        }
      });
    });
  }

  calculateStats() {
    const totalFindings = this.findings.length;
    const totalIssues = this.issues.length;
    const uniqueColors = new Set(this.findings.map(f => f.rawValue)).size;
    
    return {
      totalFindings,
      totalIssues,
      uniqueColors,
      adoptionRate: totalFindings > 0 ? ((totalFindings - totalIssues) / totalFindings) * 100 : 100
    };
  }
}
