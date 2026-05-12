import fs from 'fs';
import postcss from 'postcss';

export class SizePostCSSParser {
  constructor(obs) {
    this.obs = obs;
    this.sizeProps = [
      'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
      'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'font-size', 'line-height', 'letter-spacing', 'border-radius', 'gap', 'column-gap', 'row-gap'
    ];
  }

  async parse(filePath) {
    const css = fs.readFileSync(filePath, 'utf-8');
    const findings = [];

    try {
      const root = postcss.parse(css);
      root.walkDecls(decl => {
        // Handle CSS Variables (tokens)
        if (decl.prop.startsWith('--')) {
          const category = this.inferCategoryFromVarName(decl.prop);
          if (category) {
            findings.push({
              file: filePath,
              line: decl.source.start.line,
              type: 'token-definition',
              rawValue: decl.value,
              utility: decl.prop,
              token: decl.value,
              confidence: 1.0,
              category
            });
          }
        }

        // Handle standard size properties
        if (this.sizeProps.includes(decl.prop)) {
          findings.push({
            file: filePath,
            line: decl.source.start.line,
            type: 'style',
            rawValue: decl.value,
            utility: decl.prop,
            token: decl.value,
            confidence: 1.0,
            snippet: `${decl.prop}: ${decl.value}`
          });
        }
      });
    } catch (e) {
      this.obs.error(`Failed to parse CSS ${filePath}`, e);
    }

    return findings;
  }

  inferCategoryFromVarName(name) {
    if (name.includes('font-size') || name.includes('line-height') || name.includes('text')) return 'typography';
    if (name.includes('spacing') || name.includes('gap') || name.includes('padding') || name.includes('margin')) return 'spacing';
    if (name.includes('radius')) return 'radius';
    if (name.includes('width') || name.includes('height') || name.includes('size')) return 'sizing';
    return null;
  }
}
