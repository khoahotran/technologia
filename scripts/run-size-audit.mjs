import { SizeAuditEngine } from './size-audit/engine.mjs';
import fs from 'fs';
import path from 'path';

async function main() {
  const engine = new SizeAuditEngine();
  const results = await engine.run();

  const outputDir = 'docs/size-audit';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save raw results for later use
  fs.writeFileSync(
    path.join(outputDir, 'size-audit-report.json'),
    JSON.stringify(results, null, 2)
  );

  // Generate a basic report
  let report = `# Sizing Audit Report\n\n`;
  report += `## Summary\n`;
  report += `- **Total Usages**: ${results.stats.totalUsages}\n`;
  report += `- **Arbitrary Values**: ${results.stats.arbitraryUsages}\n`;
  report += `- **Token Adoption Rate**: ${results.stats.adoptionRate.toFixed(2)}%\n`;
  report += `- **Unique Sizes**: ${results.stats.uniqueSizeCount}\n`;
  report += `- **Unique Spacing Scale**: ${results.stats.uniqueSpacingCount}\n`;
  report += `- **Unique Typography Scale**: ${results.stats.uniqueTypographyCount}\n\n`;

  report += `## Top Arbitrary Values\n`;
  const arbitraryCounts = {};
  results.issues.filter(i => i.ruleId === 'SZ001').forEach(i => {
    arbitraryCounts[i.rawValue] = (arbitraryCounts[i.rawValue] || 0) + 1;
  });
  
  Object.entries(arbitraryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([val, count]) => {
      report += `- \`${val}\`: ${count} occurrences\n`;
    });

  report += `\n## Details by File\n`;
  const filesWithIssues = [...new Set(results.issues.map(i => i.file))];
  filesWithIssues.forEach(file => {
    report += `### ${file.replace(process.cwd(), '')}\n`;
    results.issues.filter(i => i.file === file).forEach(issue => {
      report += `- L${issue.line}: **${issue.ruleId}** - ${issue.message}\n`;
    });
    report += `\n`;
  });

  fs.writeFileSync(path.join(outputDir, 'size-audit-report.md'), report);

  console.log(`\nSizing Audit Complete!`);
  console.log(`Report saved to: ${outputDir}/size-audit-report.md`);
  console.log(`Adoption Rate: ${results.stats.adoptionRate.toFixed(2)}%`);
}

main().catch(console.error);
