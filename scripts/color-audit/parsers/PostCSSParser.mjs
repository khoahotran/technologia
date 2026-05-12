import fs from 'fs';
import postcss from 'postcss';

export class PostCSSParser {
  constructor(resolver, obs) {
    this.resolver = resolver;
    this.obs = obs;
  }

  async parse(filePath) {
    const css = fs.readFileSync(filePath, 'utf-8');
    const result = await postcss().process(css, { from: filePath });
    const findings = [];

    result.root.walkDecls(decl => {
      // 1. Extract variable definitions
      if (decl.prop.startsWith('--')) {
        this.resolver.register(decl.prop, decl.value, filePath);
      }

      // 2. Identify color usages in properties
      if (this.isColorProp(decl.prop)) {
        findings.push({
          file: filePath,
          line: decl.source.start.line,
          prop: decl.prop,
          rawValue: decl.value,
          type: this.getUsageType(decl.prop),
          snippet: `${decl.prop}: ${decl.value}`
        });
      }
    });

    return findings;
  }

  isColorProp(prop) {
    const colorProps = ['color', 'background', 'background-color', 'border-color', 'fill', 'stroke', 'box-shadow', 'text-shadow', 'outline-color', 'ring-color'];
    return colorProps.includes(prop) || prop.startsWith('--color-');
  }

  getUsageType(prop) {
    if (prop.includes('background')) return 'background';
    if (prop.includes('border') || prop.includes('outline') || prop.includes('divide')) return 'border';
    if (prop === 'color') return 'text';
    if (prop.includes('shadow')) return 'shadow';
    if (prop.includes('fill') || prop.includes('stroke')) return 'svg';
    if (prop.includes('ring')) return 'ring';
    return 'other';
  }
}
