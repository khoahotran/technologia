export class TokenResolver {
  constructor(obs) {
    this.tokens = new Map(); // name -> { value, lineage, confidence }
    this.obs = obs;
  }

  register(name, value, source = 'theme', confidence = 1.0) {
    this.tokens.set(name, { 
      value, 
      lineage: [source], 
      confidence 
    });
    this.obs.debugLog(`Registered token: ${name} = ${value}`);
  }

  resolve(value, depth = 0, seen = new Set()) {
    if (depth > 10) {
      return { value: 'RECURSION_LIMIT', confidence: 0, lineage: ['error:recursion'] };
    }

    if (typeof value !== 'string') return { value, confidence: 1.0, lineage: [] };

    // Match var(--name, fallback)
    const varRegex = /var\((--[\w-]+)(?:,\s*(.+))?\)/g;
    let match;
    let resolvedValue = value;
    let totalConfidence = 1.0;
    let fullLineage = [];

    // Simple case: exact match var(--name)
    const simpleVarMatch = value.match(/^var\((--[\w-]+)\)$/);
    if (simpleVarMatch) {
      const tokenName = simpleVarMatch[1];
      
      if (seen.has(tokenName)) {
        return { value: 'CYCLE_DETECTED', confidence: 0, lineage: [...fullLineage, `cycle:${tokenName}`] };
      }
      seen.add(tokenName);

      const token = this.tokens.get(tokenName);
      if (token) {
        const next = this.resolve(token.value, depth + 1, seen);
        return {
          value: next.value,
          confidence: token.confidence * next.confidence,
          lineage: [tokenName, ...next.lineage]
        };
      } else {
        return { value: 'UNRESOLVED', confidence: 0.1, lineage: [`unresolved:${tokenName}`] };
      }
    }

    // Handle complex strings with multiple vars or fallbacks
    // (Omitted for simplicity in first pass, but will add if needed)
    
    return { value: resolvedValue, confidence: totalConfidence, lineage: fullLineage };
  }

  getLineage(value) {
    const result = this.resolve(value);
    return result.lineage;
  }
}
