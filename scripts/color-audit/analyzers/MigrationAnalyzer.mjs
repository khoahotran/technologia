import { differenceCie76 } from 'culori';

export class MigrationAnalyzer {
  constructor(resolver, similarity) {
    this.resolver = resolver;
    this.similarity = similarity;
  }

  analyze(issues) {
    const recommendations = [];
    const tokens = Array.from(this.resolver.tokens.entries()).map(([name, data]) => ({
      name,
      value: data.value,
      lineage: data.lineage
    }));

    issues.forEach(issue => {
      if (issue.ruleId === 'CA001') {
        const rawColor = this.extractColor(issue.rawValue);
        if (!rawColor) return;

        // Find closest token
        let closestToken = null;
        let minDiff = Infinity;
        let minScore = Infinity;

        tokens.forEach(token => {
          try {
            const resolvedTokenValue = this.resolver.resolve(token.name);
            if (!resolvedTokenValue) return;

            const diff = differenceCie76()(rawColor, resolvedTokenValue);
            
            // Score the candidate (lower is better)
            let score = diff;
            
            // Bonus for semantic names
            if (token.name.includes('primary') || token.name.includes('secondary') || token.name.includes('accent')) score -= 0.5;
            if (token.name.includes('muted') || token.name.includes('description')) score -= 0.3;
            
            // Bonus for matching utility type
            if (issue.rawValue.startsWith('bg-') && token.name.includes('background')) score -= 1;
            if (issue.rawValue.startsWith('text-') && (token.name.includes('foreground') || token.name.includes('text'))) score -= 1;
            if (issue.rawValue.startsWith('border-') && token.name.includes('border')) score -= 1;

            // Penalty for internal/generic names
            if (token.name.startsWith('--color-')) score += 0.5; // Prefer the direct semantic token if possible
            if (token.name === '--background' || token.name === '--foreground') score += 0.2;

            if (score < minScore) {
              minScore = score;
              minDiff = diff;
              closestToken = token;
            }
          } catch (e) {}
        });

        if (closestToken && minDiff < 5) { // Threshold for migration suggestion
          recommendations.push({
            file: issue.file,
            line: issue.line,
            currentValue: issue.rawValue,
            suggestedToken: closestToken.name,
            diff: minDiff,
            confidence: minDiff < 1 ? 'HIGH' : 'MEDIUM'
          });
        }
      }
    });

    return recommendations;
  }

  extractColor(val) {
    if (val.startsWith('bg-[') || val.startsWith('text-[') || val.startsWith('border-[')) {
      return val.match(/\[(.+)\]/)?.[1];
    }
    return val;
  }
}
