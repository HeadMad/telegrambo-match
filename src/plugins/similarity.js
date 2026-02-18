// Calculate Levenshtein distance between two strings
const levenshteinDistance = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  return matrix[len2][len1];
};

// Calculate similarity score (0-1)
const calculateSimilarity = (str1, str2) => {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLen;
};

// Plugin factory that accepts options
export default (options = {}) => {
  const defaultOptions = {
    threshold: 0.2,
    caseInsensitive: 1,
    trim: true
  };

  const mergeOptions = (baseOptions, overrides) => ({
    ...baseOptions,
    ...overrides
  });

  return {
    events: ['message', 'channel_post'],
    plugin: (ctx, eventName) => {
      let text = ('text' in ctx ? ctx.text : null) || ('caption' in ctx ? ctx.caption : null);
      
      if (!text)
        return;
      
      // Determine initial trim setting
      let currentOptions = mergeOptions(defaultOptions, options);
      if (currentOptions.trim) text = text.trim();

      return (pattern, handler) => {
        // Handle both string pattern and object with value and options
        let patternStr;
        let matchOptions = currentOptions;

        if (typeof pattern === 'string') {
          patternStr = pattern;
        } else if (typeof pattern === 'object' && pattern !== null && 'value' in pattern) {
          patternStr = pattern.value;
          // Merge initialization options with pattern-specific options
          const patternOptions = { ...pattern };
          delete patternOptions.value;
          matchOptions = mergeOptions(currentOptions, patternOptions);
        } else {
          // Fallback for unexpected pattern format
          patternStr = String(pattern);
        }

        let comparisonText = text;
        if (matchOptions.caseInsensitive) {
          comparisonText = text.toLowerCase();
          patternStr = patternStr.toLowerCase();
        }

        const score = calculateSimilarity(comparisonText, patternStr);

        if (score >= matchOptions.threshold) {
          return handler(ctx, text, score);
        }
      };
    }
  };
}
