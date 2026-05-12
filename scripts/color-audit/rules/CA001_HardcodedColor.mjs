export const CA001 = {
  id: 'CA001',
  name: 'Hardcoded Color Usage',
  severity: 'HIGH',
  description: 'Detected a hardcoded color value that should be a design token.',
  
  check(finding, resolver) {
    // If it's a tailwind utility but has an arbitrary value like bg-[#123456]
    if (finding.token && finding.token.startsWith('[') && finding.token.endsWith(']')) {
      const inner = finding.token.slice(1, -1);
      if (this.isRawColor(inner)) {
        return {
          issue: true,
          confidence: 1.0,
          message: `Hardcoded arbitrary value: ${inner}`,
          hint: 'Convert to a theme color or use a CSS variable.'
        };
      }
    }

    // If it's a raw color in CSS or Style
    if (this.isRawColor(finding.rawValue)) {
      return {
        issue: true,
        confidence: 1.0,
        message: `Hardcoded color: ${finding.rawValue}`,
        hint: 'Migrate to a design token.'
      };
    }

    return { issue: false };
  },

  isRawColor(val) {
    if (!val) return false;
    return /^#([A-Fa-f0-9]{3,8})$/.test(val) || 
           /^rgba?\(.+\)$/.test(val) || 
           /^hsla?\(.+\)$/.test(val) ||
           ['white', 'black', 'transparent', 'inherit', 'currentColor'].includes(val.toLowerCase());
  }
};
