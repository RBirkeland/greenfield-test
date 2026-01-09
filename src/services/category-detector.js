/**
 * CategoryDetector - Auto-categorizes TODOs based on title keywords
 */
export class CategoryDetector {
  constructor() {
    // Order matters: check more specific patterns first
    this.patterns = {
      bug: /\b(bug|fix|issue|error|crash|broken|failed?)\b/i,
      design: /\b(design|ui|ux|style|visual|layout|theme)\b/i,
      docs: /\b(doc|documentation|readme|guide|comment|tutorial)\b/i,
      refactor: /\b(refactor|refactoring|cleanup|clean|reorganize)\b/i,
      test: /\b(test|testing|unit test|integration test|e2e|qa|qc)\b/i,
      performance: /\b(performance|optimize|optimization|speed|memory|profil|benchmark)\b/i,
      feature: /\b(feature|add|implement|create|enable)\b/i,
    };
  }

  /**
   * Detect category from title
   * @param {string} title - TODO title
   * @returns {string} Category name or "Other"
   */
  detect(title) {
    if (!title || typeof title !== 'string') {
      return 'Other';
    }

    for (const [category, pattern] of Object.entries(this.patterns)) {
      if (pattern.test(title)) {
        return category;
      }
    }

    return 'Other';
  }

  /**
   * Add a custom keyword pattern
   * @param {string} category - Category name
   * @param {RegExp|string} pattern - Pattern to match
   */
  addPattern(category, pattern) {
    if (typeof pattern === 'string') {
      pattern = new RegExp(`\\b(${pattern})\\b`, 'i');
    }
    this.patterns[category] = pattern;
  }

  /**
   * Get all available categories
   * @returns {Array} List of category names
   */
  getCategories() {
    return Object.keys(this.patterns).concat(['Other']);
  }
}
