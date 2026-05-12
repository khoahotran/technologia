export class SizingAnalyzer {
  constructor(config) {
    this.config = config;
    // Common sizing/spacing utility prefixes
    this.spacingPrefixes = ['p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'gap', 'space-x', 'space-y', 'inset', 'top', 'right', 'bottom', 'left'];
    this.sizingPrefixes = ['w', 'h', 'min-w', 'min-h', 'max-w', 'max-h', 'size', 'aspect', 'flex-basis'];
    this.typographyPrefixes = ['text', 'font', 'leading', 'tracking', 'line-clamp'];
    this.radiusPrefixes = ['rounded'];
  }

  analyze(findings) {
    const sizingIssues = [];
    
    for (const finding of findings) {
      const { utility, token, rawValue, type } = finding;
      
      // 1. Detect Arbitrary Values (e.g., w-[237px])
      if (token && token.startsWith('[') && token.endsWith(']')) {
        sizingIssues.push({
          ...finding,
          ruleId: 'SZ001',
          severity: 'HIGH',
          message: `Arbitrary sizing value detected: ${rawValue}`
        });
        continue;
      }

      // 2. Detect Non-Standard Scale (Heuristic)
      // If it's a numeric value not in the standard 0, 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20... scale
      // But Tailwind scale is quite large, so we mostly focus on "magic numbers" in arbitrary values.
      
      // 3. Detect Magic Numbers in inline styles (if parsed)
      if (type === 'style') {
        sizingIssues.push({
          ...finding,
          ruleId: 'SZ002',
          severity: 'MEDIUM',
          message: `Inline style sizing detected: ${rawValue}`
        });
      }
    }

    return sizingIssues;
  }
}
