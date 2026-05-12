import fs from 'fs';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
const traverse = traverseModule.default;

export class BabelParser {
  constructor(resolver, obs) {
    this.resolver = resolver;
    this.obs = obs;
  }

  async parse(filePath) {
    const code = fs.readFileSync(filePath, 'utf-8');
    const findings = [];

    try {
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy'],
      });

      traverse(ast, {
        JSXAttribute: (path) => {
          const { name, value } = path.node;

          // Handle className
          if (name.name === 'className' || name.name === 'class') {
            if (value.type === 'StringLiteral') {
              this.extractTailwindClasses(value.value, filePath, value.loc.start.line, findings);
            } else if (value.type === 'JSXExpressionContainer') {
              this.handleExpression(value.expression, filePath, value.loc.start.line, findings);
            }
          }

          // Handle style
          if (name.name === 'style' && value.type === 'JSXExpressionContainer') {
            this.handleStyleObject(value.expression, filePath, value.loc.start.line, findings);
          }
        },

        // Handle direct calls to cn, clsx, etc.
        CallExpression: (path) => {
          const callee = path.node.callee.name;
          if (['cn', 'clsx', 'twMerge', 'cva', 'tv'].includes(callee)) {
            path.node.arguments.forEach(arg => {
              this.handleExpression(arg, filePath, arg.loc?.start.line || path.node.loc.start.line, findings, true);
            });
          }
        }
      });
    } catch (e) {
      this.obs.error(`Failed to parse ${filePath}, falling back to regex mode.`, e);
      // Fallback logic will be in engine
      throw e; 
    }

    return findings;
  }

  extractTailwindClasses(classStr, file, line, findings) {
    const classes = classStr.split(/\s+/);
    classes.forEach(cls => {
      const match = cls.match(/^(text|bg|border|ring|fill|stroke|shadow|from|via|to|outline|divide|decoration|accent|caret)-(.+)$/);
      if (match) {
        findings.push({
          file,
          line,
          type: this.getTailwindType(match[1]),
          rawValue: cls,
          utility: match[1],
          token: match[2],
          confidence: cls.includes('[') ? 0.9 : 1.0, // Arbitrary values slightly lower confidence if dynamic
          snippet: cls
        });
      }
    });
  }

  handleExpression(expr, file, line, findings, isFromFn = false) {
    if (expr.type === 'StringLiteral') {
      this.extractTailwindClasses(expr.value, file, line, findings);
    } else if (expr.type === 'TemplateLiteral') {
      expr.quasis.forEach(quasi => {
        this.extractTailwindClasses(quasi.value.raw, file, line, findings);
      });
      if (expr.expressions.length > 0) {
        findings.push({
          file,
          line,
          type: 'dynamic',
          rawValue: 'UNRESOLVED_TEMPLATE_LITERAL',
          confidence: 0.2,
          snippet: 'dynamic template literal'
        });
      }
    } else if (expr.type === 'ObjectExpression') {
      this.handleStyleObject(expr, file, line, findings);
    } else if (expr.type === 'ArrayExpression') {
      expr.elements.forEach(el => this.handleExpression(el, file, line, findings, isFromFn));
    } else if (expr.type === 'ConditionalExpression') {
      this.handleExpression(expr.consequent, file, line, findings, isFromFn);
      this.handleExpression(expr.alternate, file, line, findings, isFromFn);
    }
  }

  handleStyleObject(obj, file, line, findings) {
    if (obj.type !== 'ObjectExpression') return;
    obj.properties.forEach(prop => {
      if (prop.type === 'ObjectProperty' && prop.key.name) {
        const key = prop.key.name;
        if (['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'].includes(key)) {
          if (prop.value.type === 'StringLiteral') {
            findings.push({
              file,
              line,
              type: this.getStyleType(key),
              rawValue: prop.value.value,
              confidence: 1.0,
              snippet: `${key}: ${prop.value.value}`
            });
          } else {
            findings.push({
              file,
              line,
              type: 'dynamic',
              rawValue: 'DYNAMIC_STYLE_VALUE',
              confidence: 0.1,
              snippet: `${key}: ...`
            });
          }
        }
      }
    });
  }

  getTailwindType(prefix) {
    if (prefix === 'text') return 'text';
    if (prefix === 'bg' || prefix === 'from' || prefix === 'via' || prefix === 'to') return 'background';
    if (prefix === 'border' || prefix === 'outline' || prefix === 'divide') return 'border';
    if (prefix === 'ring') return 'ring';
    if (prefix === 'shadow') return 'shadow';
    if (prefix === 'fill' || prefix === 'stroke') return 'svg';
    return 'other';
  }

  getStyleType(key) {
    if (key === 'backgroundColor') return 'background';
    if (key === 'color') return 'text';
    if (key === 'borderColor') return 'border';
    return 'other';
  }
}
