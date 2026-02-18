# Similarity Matcher

Match messages by text similarity using Levenshtein distance. This is a factory plugin that accepts configuration options for initialization and per-invocation overrides.

## Supported Pattern Types

- **String**: Fuzzy match against text (with configurable threshold)
  ```js
  { similarity: 'hello' }    // Will match "helo", "hell", etc. based on threshold
  ```

- **Object with value and options**: Fuzzy match with per-invocation settings override
  ```js
  { similarity: { value: 'hello', threshold: 0.9 } }    // Override threshold for this specific match
  { similarity: { value: 'HELLO', caseInsensitive: false } }    // Override case sensitivity
  ```

## Plugin Structure

```js
export default (options = {}) => {
  const defaultOptions = {
    threshold: 0.8,
    caseInsensitive: false,
    trim: true
  };

  return {
    events: ['message', 'channel_post'],
    plugin: (ctx, eventName, plugins) => {
      let text = ctx.text || ctx.caption;
      
      if (!text) return;

      let currentOptions = mergeOptions(defaultOptions, options);
      if (currentOptions.trim) text = text.trim();

      // Return matcher function (MUST return handler result)
      return (pattern, handler) => {
        let patternStr;
        let matchOptions = currentOptions;

        // Support both string and object with value property
        if (typeof pattern === 'string') {
          patternStr = pattern;
        } else if (typeof pattern === 'object' && pattern !== null && 'value' in pattern) {
          patternStr = pattern.value;
          // Merge initialization options with pattern-specific options
          const patternOptions = { ...pattern };
          delete patternOptions.value;
          matchOptions = mergeOptions(currentOptions, patternOptions);
        } else {
          patternStr = String(pattern);
        }

        let comparisonText = text;
        if (matchOptions.caseInsensitive) {
          comparisonText = text.toLowerCase();
          patternStr = patternStr.toLowerCase();
        }

        const score = calculateSimilarity(comparisonText, patternStr);

        if (score >= matchOptions.threshold) {
          return handler(ctx, text, score);  // ⚠️ MUST return
        }
      };
    }
  };
}
```

⚠️ **Important**: Handler result MUST be returned for compatibility with composite plugins like `all()` and `any()`.

## Configuration Options

These options can be set during initialization and overridden per invocation.

### Initialization Settings

Set default behavior for all matches:

```js
similarity({ threshold: 0.8, caseInsensitive: false, trim: true })
```

### Available Options

- `threshold` (0-1, default: 0.8)
  - Minimum similarity score required to trigger the handler
  - 0 = any match (disabled)
  - 1 = exact match only
  - Example: 0.75 = 75% match required
  - Can be overridden per invocation

- `caseInsensitive` (boolean, default: false)
  - Ignore case when comparing text
  - "Hello" will match "HELLO"
  - Can be overridden per invocation

- `trim` (boolean, default: true)
  - Trim whitespace from message text before comparison
  - " hello " becomes "hello"
  - Note: This is only set at initialization and affects the context text
  - Cannot be overridden per invocation (applied to message text globally)

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
bot.match.similarity('hello', (ctx, text, score) => {
  ctx.sendMessage({ text: `Matched "${text}" with ${(score * 100).toFixed(1)}% similarity` });
});

bot.match.similarity('help', (ctx, text, score) => {
  ctx.sendMessage({ text: `Need help? (${(score * 100).toFixed(1)}% match)` });
});
```

## Handler Parameters

- `ctx` - The context object with message data
- `text` - The matched message text
- `score` - Similarity score (0-1, where 1 is perfect match)

## Examples

### Basic Similarity Matching

```js
const match = setMatch({
  similarity: similarity({ threshold: 0.8 })
})(bot);

bot.match.similarity('hello', (ctx, text, score) => {
  ctx.sendMessage({ text: `Hi! (${(score * 100).toFixed(1)}% match)` });
});
```

With threshold 0.8, these will match:
- "hello" (100%)
- "helo" (80%)
- "hell" (80%)
- But NOT "hey" (60%)

### Case-Insensitive Matching

```js
const match = setMatch({
  similarity: similarity({ 
    threshold: 0.75,
    caseInsensitive: true 
  })
})(bot);

bot.match.similarity('Start', (ctx, text, score) => {
  ctx.sendMessage({ text: 'Starting up!' });
});

// Matches: "start", "START", "StArT" etc.
```

### Multiple Patterns with Chaining

```js
const match = setMatch({
  similarity: similarity({ threshold: 0.7 })
})(bot);

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

### Typo Tolerance

```js
const match = setMatch({
  similarity: similarity({ 
    threshold: 0.75,
    caseInsensitive: true 
  })
})(bot);

// User types "helo" instead of "hello"
bot.match.similarity('hello', (ctx, text, score) => {
  ctx.sendMessage({ text: `Did you mean "hello"? (${(score * 100).toFixed(1)}% match)` });
});
```

### Per-Invocation Configuration Override

```js
const match = setMatch({
  similarity: similarity({ threshold: 0.8, caseInsensitive: true })
})(bot);

// Use initialization settings (threshold: 0.8, caseInsensitive: true)
bot.match.similarity('hello', (ctx, text, score) => {
  ctx.sendMessage({ text: `Hi! (${(score * 100).toFixed(1)}% match)` });
});

// Override threshold for stricter matching
bot.match.similarity({ value: 'password', threshold: 0.95 }, (ctx, text, score) => {
  ctx.sendMessage({ text: 'Password reset requested' });
});

// Override caseInsensitive setting
bot.match.similarity({ value: 'API', caseInsensitive: false }, (ctx, text, score) => {
  ctx.sendMessage({ text: 'API documentation' });
});

// Override multiple settings at once
bot.match.similarity({ 
  value: 'admin', 
  threshold: 0.9, 
  caseInsensitive: false 
}, (ctx, text, score) => {
  ctx.sendMessage({ text: 'Admin panel access' });
});
```

**Important**: When using object pattern syntax, the `value` property contains the pattern string, and any other properties override the initialization settings for that specific invocation only.

### With composite plugin

```js
// Match similar text only in specific chat
bot.match.all([
  { similarity: 'secret' },
  { chat: PRIVATE_CHAT_ID }
], (ctx, text, score) => {
  ctx.sendMessage({ text: `Secret detected with ${(score * 100).toFixed(1)}% confidence` });
});

// Or with per-invocation options in composite plugin
bot.match.all([
  { similarity: { value: 'secret', threshold: 0.9 } },
  { chat: PRIVATE_CHAT_ID }
], (ctx, text, score) => {
  ctx.sendMessage({ text: `Secret detected with high confidence` });
});
```

## How It Works

The similarity matcher uses the **Levenshtein distance** algorithm:

```
Distance = minimum number of single-character edits (insert, delete, substitute)
Similarity = 1 - (distance / max_length)
```

**Example calculations:**
- "hello" vs "hello" = 1.0 (100% match)
- "hello" vs "hallo" = 0.8 (80% match, 1 substitution)
- "hello" vs "help" = 0.67 (67% match, 2 operations needed)

## Threshold Recommendations

- **0.9+** - Very strict, only small typos/variations
- **0.8** - Standard, good for most use cases
- **0.7** - Loose, tolerates more variations
- **0.6** - Very loose, many false positives likely
- **< 0.6** - Too loose for most cases

## Works with Text and Captions

Supports both message text and channel post captions:

```js
const match = setMatch({
  similarity: similarity({ threshold: 0.8 })
})(bot);

// Works with both message.text and channel_post.caption
bot.match.similarity('hello', (ctx, text, score) => {
  ctx.sendMessage({ text: 'Matched!' });
});
```

## Notes

- Uses Levenshtein distance algorithm for similarity calculation
- Works with both message text and channel post captions
- Similarity score is always between 0 and 1
- Useful for typo tolerance, user-friendly commands
- Can handle any UTF-8 text
