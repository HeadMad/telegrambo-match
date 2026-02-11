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
  const {
    threshold = 0.8,
    caseInsensitive = false,
    trim = true
  } = options;

  // Return plugin configuration
  return {
    events: ['message'],
    plugin: (ctx, checker, eventName) => {
      if (!('text' in ctx))
        return;

      let text = ctx.text;
      if (trim) text = text.trim();
      const comparisonText = caseInsensitive ? text.toLowerCase() : text;

      // Iterate through all patterns using checker.each()
      checker.each((pattern, handler) => {
        // Handle string patterns (exact similarity matching)
        if (pattern.constructor.name !== 'RegExp') {
          let patternStr = pattern;
          if (caseInsensitive) patternStr = patternStr.toLowerCase();

          const score = calculateSimilarity(comparisonText, patternStr);

          if (score >= threshold) {
            handler(ctx, text, score);
          }
        }
        // Handle regex patterns (only check if they match)
        else {
          const testText = caseInsensitive ? text.toLowerCase() : text;
          if (pattern.test(testText)) {
            // For regex, calculate similarity against the matched text
            const matched = text.match(pattern);
            if (matched) {
              const score = calculateSimilarity(comparisonText, matched[0].toLowerCase ? matched[0].toLowerCase() : matched[0]);
              if (score >= threshold) {
                handler(ctx, text, score);
              }
            }
          }
        }
      });
    }
  };
}
