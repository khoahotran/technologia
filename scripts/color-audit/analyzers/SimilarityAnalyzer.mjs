import { formatHex, differenceEuclidean, differenceCie76, differenceCmc } from 'culori';

export class SimilarityAnalyzer {
  constructor(threshold = 0.05) {
    this.threshold = threshold; // DeltaE threshold
  }

  analyze(colors) {
    const uniqueColors = Array.from(new Set(colors.filter(c => c && !c.includes('var'))));
    const duplicates = [];

    for (let i = 0; i < uniqueColors.length; i++) {
      for (let j = i + 1; j < uniqueColors.length; j++) {
        const c1 = uniqueColors[i];
        const c2 = uniqueColors[j];
        
        try {
          // Use DeltaE 76 for simplicity, or CMC for enterprise-grade
          const diff = differenceCie76()(c1, c2);
          if (diff < this.threshold * 100) { // differenceCie76 returns 0-100 range
            duplicates.push({ color1: c1, color2: c2, diff });
          }
        } catch (e) {
          // Ignore invalid colors
        }
      }
    }

    return duplicates;
  }

  normalize(color) {
    try {
      return formatHex(color);
    } catch (e) {
      return color;
    }
  }
}
