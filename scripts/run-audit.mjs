import { AuditEngine } from './color-audit/engine.mjs';
import { Reporter } from './color-audit/reporter.mjs';

async function main() {
  const engine = new AuditEngine({
    verbose: true,
    debug: false,
    traceTokens: ['--primary']
  });

  const results = await engine.run();
  
  const reporter = new Reporter(results, engine.config);
  reporter.save();

  console.log('\nAudit Complete!');
  console.log(`Report saved to: ${engine.config.outputDir}/color-audit-report.md`);
  console.log(`Adoption Rate: ${results.stats.adoptionRate.toFixed(2)}%`);

  const MIN_ADOPTION_RATE = 99.0;
  if (results.stats.adoptionRate < MIN_ADOPTION_RATE) {
    console.error(`[FAIL] Token adoption rate is below ${MIN_ADOPTION_RATE}%!`);
    process.exit(1);
  }
}

main().catch(console.error);
