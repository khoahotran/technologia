export class Observability {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.debug = options.debug || false;
    this.traceTokens = new Set(options.traceTokens || []);
  }

  log(message) {
    if (this.verbose || this.debug) {
      console.log(`[INFO] ${message}`);
    }
  }

  debugLog(message) {
    if (this.debug) {
      console.log(`[DEBUG] ${message}`);
    }
  }

  error(message, error) {
    console.error(`[ERROR] ${message}`, error);
  }

  trace(tokenName, lineage) {
    if (this.traceTokens.has(tokenName) || this.traceTokens.has('*')) {
      console.log(`[TRACE:${tokenName}] Lineage: ${lineage.join(' -> ')}`);
    }
  }
}
