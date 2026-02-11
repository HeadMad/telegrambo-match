# Similarity Matcher

Match messages by text similarity using Levenshtein distance. This is a **factory plugin** that accepts configuration options.

## Plugin Structure

```js
export default (options = {}) => {
  const { threshold = 0.8, caseInsensitive = false, trim = true } = options;

  return {
    events: ['message'],
    plugin: (ctx, checker, eventName) => {
      if (!('text' in ctx)) return;

      let text = ctx.text;
      if (trim) text = text.trim();

      const { otherHandlers, regHandlers } = checker.getAll();

      for (let [pattern, handler] of otherHandlers) {
        let patternStr = pattern;
        if (caseInsensitive) patternStr = patternStr.toLowerCase();
        const score = calculateSimilarity(
          caseInsensitive ? text.toLowerCase() : text,
          patternStr
        );
        if (score >= threshold) handler(ctx, text, score);
      }

      for (let [pattern, handler] of regHandlers) {
        let comparisonText = text;
        if (caseInsensitive) comparisonText = comparisonText.toLowerCase();
        const score = calculateSimilarity(comparisonText, pattern.source);
        if (pattern.test(comparisonText) && score >= threshold) {
          handler(ctx, text, score);
        }
      }
    }
  };
}
```

## Initialization

```js
import setMatch, { similarity } from 'telegrambo-match';

const bot = telegrambo(process.env.BOT_TOKEN);
bot.match = setMatch({
  similarity: similarity({ threshold: 0.75, caseInsensitive: true })
});
```

## Usage

```js
// Match text patterns with fuzzy matching
bot.match.similarity('hello', (ctx, text, score) => {
  console.log(`Matched "${text}" with ${(score * 100).toFixed(1)}% similarity`);
});
```

## Factory Plugin

Since `similarity` requires configuration, it's a factory plugin that must be called with options:

```js
// Correct: Call similarity() with options
similarity: similarity({ threshold: 0.8 })

// Incorrect: Don't pass similarity directly
similarity: similarity  // ❌ This won't work
```

## Configuration Options

- **threshold** (0-1, default: 0.8)
  - Minimum similarity score required to trigger the handler
  - 0 = any match (disabled)
  - 1 = exact match only
  - Example: 0.75 = 75% match required

- **caseInsensitive** (boolean, default: false)
  - Ignore case when comparing text
  - "Hello" will match "HELLO"

- **trim** (boolean, default: true)
  - Trim whitespace from message text before comparison
  - " hello " becomes "hello"

## Handler Parameters

- `ctx` - The context object with message data
- `text` - The matched message text
- `score` - Similarity score (0-1, where 1 is perfect match)

## How it Works

The similarity matcher uses the **Levenshtein distance** algorithm to calculate how similar the message text is to each registered pattern:

```
Distance = minimum number of single-character edits (insertions, deletions, substitutions)
Similarity = 1 - (distance / max_length)
```

Example:
- "hello" vs "hello" = 1.0 (100% match)
- "hello" vs "hallo" = 0.8 (80% match, 1 substitution)
- "hello" vs "help" = 0.67 (67% match, 2 deletions)

## Examples

### Basic similarity matching
```js
bot.match.similarity('hello', (ctx, text, score) => {
  ctx.sendMessage({ text: `Hi! (${(score * 100).toFixed(1)}% match)` });
});
```

With threshold 0.8, these will match:
- "hello" (100%)
- "helo" (80%)
- "hell" (80%)
- But NOT "hey" (60%)

### Case-insensitive matching
```js
bot.match.similarity('Start', (ctx, text, score) => {
  ctx.sendMessage({ text: 'Starting up!' });
});

// Matches: "start", "START", "StArT" etc.
```

### Multiple patterns with different handlers
```js
bot.match
  .similarity('hello', (ctx, text, score) => {
    ctx.sendMessage({ text: 'Greeting received!' });
  })
  .similarity('help', (ctx, text, score) => {
    ctx.sendMessage({ text: 'What do you need help with?' });
  })
  .similarity('quit', (ctx, text, score) => {
    ctx.sendMessage({ text: 'Goodbye!' });
  });
```

### Typo tolerance
```js
// User types "helo" instead of "hello"
bot.match.similarity('hello', (ctx, text, score) => {
  ctx.sendMessage({ text: `Did you mean "hello"? (${(score * 100).toFixed(1)}% match)` });
});
```

## Threshold Recommendations

- **0.9+** - Very strict, only small typos/variations
- **0.8** - Standard, good for most use cases
- **0.7** - Loose, tolerates more variations
- **0.6** - Very loose, many false positives likely
- **< 0.6** - Too loose for most cases

## Performance Notes

- Levenshtein distance is O(n*m) where n and m are string lengths
- For short strings (< 100 chars), performance is negligible
- With many patterns, all are checked against each message
- Consider using `text` matcher for exact matches instead

## Common Use Cases

1. **Typo tolerance in commands**
   ```js
   match.similarity('subscribe', { threshold: 0.8 }, handler);
   ```

2. **User-friendly search**
   ```js
   match.similarity('search', { threshold: 0.7 }, handler);
   ```

3. **Spelling variations**
   ```js
   match.similarity('hello', { threshold: 0.75, caseInsensitive: true }, handler);
   ```

## Notes

- Works only with text messages (requires `text` field in ctx)
- All registered patterns are checked against each message
- Similarity score helps you provide user feedback
- Can be combined with other matchers using chaining
