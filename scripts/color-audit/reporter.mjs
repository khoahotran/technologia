import fs from 'fs';
import path from 'path';

export class Reporter {
  constructor(results, config) {
    this.results = results;
    this.config = config;
  }

  generateMarkdown() {
    const { stats, issues, findings } = this.results;
    let md = `# Color Audit Report\n\n`;

    md += `## Summary\n`;
    md += `- **Total Unique Colors**: ${stats.uniqueColors}\n`;
    md += `- **Total Usages**: ${stats.totalFindings}\n`;
    md += `- **Issues Found**: ${stats.totalIssues}\n`;
    md += `- **Token Adoption Rate**: ${stats.adoptionRate.toFixed(2)}%\n\n`;

    md += `## Detected Cycles\n`;
    md += this.renderCycles();

    md += `\n## Issues by Severity\n`;
    const high = issues.filter(i => i.severity === 'HIGH');
    const medium = issues.filter(i => i.severity === 'MEDIUM');
    md += `- **HIGH**: ${high.length}\n`;
    md += `- **MEDIUM**: ${medium.length}\n\n`;

    md += `## Top Hardcoded Colors\n`;
    const hardcoded = issues.filter(i => i.ruleId === 'CA001');
    const colorCounts = {};
    hardcoded.forEach(i => {
      colorCounts[i.rawValue] = (colorCounts[i.rawValue] || 0) + 1;
    });

    Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([color, count]) => {
        md += `- \`${color}\`: ${count} occurrences\n`;
      });

    md += `\n## Similar Color Candidates\n`;
    if (this.results.similarCandidates && this.results.similarCandidates.length > 0) {
      this.results.similarCandidates
        .sort((a, b) => a.diff - b.diff)
        .slice(0, 15)
        .forEach(c => {
          md += `- \`${c.color1}\` vs \`${c.color2}\` (DeltaE: ${c.diff.toFixed(2)})\n`;
        });
    } else {
      md += `No similar color candidates found.\n`;
    }

    md += `\n## Migration Recommendations\n`;
    if (this.results.recommendations && this.results.recommendations.length > 0) {
      md += `| File | Line | Current | Suggested Token | Confidence |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- |\n`;
      this.results.recommendations
        .sort((a, b) => (a.confidence === 'HIGH' ? 0 : 1))
        .slice(0, 30)
        .forEach(r => {
          const relPath = path.relative(this.config.rootDir, r.file);
          md += `| ${relPath} | ${r.line} | \`${r.currentValue}\` | \`${r.suggestedToken}\` | ${r.confidence} |\n`;
        });
    } else {
      md += `No migration recommendations found.\n`;
    }

    md += `\n## Details by File\n`;
    const byFile = {};
    issues.forEach(i => {
      const relPath = path.relative(this.config.rootDir, i.file);
      if (!byFile[relPath]) byFile[relPath] = [];
      byFile[relPath].push(i);
    });

    Object.entries(byFile).forEach(([file, fileIssues]) => {
      md += `### ${file}\n`;
      fileIssues.forEach(i => {
        md += `- L${i.line}: **${i.ruleId}** - ${i.message} (\`${i.snippet}\`)\n`;
      });
      md += `\n`;
    });

    return md;
  }

  renderCycles() {
    const cycles = this.results.cycles || [];
    if (cycles.length === 0) return `No token cycles detected.\n`;

    let md = ``;
    cycles.forEach(cycle => {
      md += `- Cycle: \`${cycle.join(' -> ')}\`\n`;
    });
    return md;
  }

  generateJSON() {
    return JSON.stringify(this.results, null, 2);
  }

  save() {
    const outputDir = path.join(this.config.rootDir, this.config.outputDir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(path.join(outputDir, 'color-audit-report.md'), this.generateMarkdown());
    fs.writeFileSync(path.join(outputDir, 'color-audit-report.json'), this.generateJSON());
  }
}
