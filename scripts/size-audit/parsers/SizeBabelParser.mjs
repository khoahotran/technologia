import fs from 'fs';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
const traverse = traverseModule.default;

export class SizeBabelParser {
  constructor(obs) {
    this.obs = obs;
    // Comprehensive pattern for sizing, spacing, and typography
    this.pattern = /^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-x|space-y|inset|top|right|bottom|left|w|h|min-w|min-h|max-w|max-h|size|aspect|flex-basis|text|font|leading|tracking|line-clamp|rounded)(-.+)?$/;
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

          if (name.name === 'className' || name.name === 'class') {
            if (value?.type === 'StringLiteral') {
              this.extractTailwindClasses(value.value, filePath, value.loc.start.line, findings);
            } else if (value?.type === 'JSXExpressionContainer') {
              this.handleExpression(value.expression, filePath, value.loc.start.line, findings);
            }
          }

          if (name.name === 'style' && value?.type === 'JSXExpressionContainer') {
            this.handleStyleObject(value.expression, filePath, value.loc.start.line, findings);
          }
        },

        CallExpression: (path) => {
          const callee = path.node.callee.name || path.node.callee.property?.name;
          if (['cn', 'clsx', 'twMerge', 'cva', 'tv'].includes(callee)) {
            path.node.arguments.forEach(arg => {
              this.handleExpression(arg, filePath, arg.loc?.start.line || path.node.loc.start.line, findings, true);
            });
          }
        }
      });
    } catch (e) {
      this.obs.error(`Failed to parse ${filePath}`, e);
    }

    return findings;
  }

  extractTailwindClasses(classStr, file, line, findings) {
    const classes = classStr.split(/\s+/);
    classes.forEach(cls => {
      const match = cls.match(this.pattern);
      if (match) {
        findings.push({
          file,
          line,
          type: this.getUtilityCategory(match[1]),
          rawValue: cls,
          utility: match[1],
          token: match[2]?.substring(1) || '', // remove leading -
          confidence: cls.includes('[') ? 0.9 : 1.0,
          snippet: cls
        });
      }
    });
  }

  handleExpression(expr, file, line, findings, isFromFn = false) {
    if (!expr) return;
    if (expr.type === 'StringLiteral') {
      this.extractTailwindClasses(expr.value, file, line, findings);
    } else if (expr.type === 'TemplateLiteral') {
      expr.quasis.forEach(quasi => {
        this.extractTailwindClasses(quasi.value.raw, file, line, findings);
      });
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
    const sizeProps = [
      'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
      'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
      'fontSize', 'lineHeight', 'letterSpacing', 'borderRadius', 'gap'
    ];
    
    obj.properties.forEach(prop => {
      if (prop.type === 'ObjectProperty' && prop.key.name) {
        const key = prop.key.name;
        if (sizeProps.includes(key)) {
          if (prop.value.type === 'StringLiteral' || prop.value.type === 'NumericLiteral') {
            findings.push({
              file,
              line,
              type: 'style',
              rawValue: `${key}: ${prop.value.value}`,
              utility: key,
              token: String(prop.value.value),
              confidence: 1.0,
              snippet: `${key}: ${prop.value.value}`
            });
          }
        }
      }
    });
  }

  getUtilityCategory(prefix) {
    if (['p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'gap', 'space-x', 'space-y'].includes(prefix)) return 'spacing';
    if (['w', 'h', 'min-w', 'min-h', 'max-w', 'max-h', 'size', 'aspect', 'flex-basis'].includes(prefix)) return 'sizing';
    if (['text', 'font', 'leading', 'tracking', 'line-clamp'].includes(prefix)) return 'typography';
    if (['rounded'].includes(prefix)) return 'radius';
    if (['inset', 'top', 'right', 'bottom', 'left'].includes(prefix)) return 'layout';
    return 'other';
  }
}
