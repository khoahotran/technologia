import { wcagContrast } from 'culori';

export class ContrastAnalyzer {
  analyze(fg, bg) {
    try {
      const contrast = wcagContrast(fg, bg);
      return {
        contrast,
        aa: contrast >= 4.5,
        aaa: contrast >= 7.0,
        aaLarge: contrast >= 3.0
      };
    } catch (e) {
      return null;
    }
  }

  getAccessibilityStatus(contrast) {
    if (contrast >= 7) return 'AAA';
    if (contrast >= 4.5) return 'AA';
    if (contrast >= 3) return 'Large Text Only';
    return 'FAIL';
  }
}
