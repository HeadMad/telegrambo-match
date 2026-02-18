# Plugin Development Guide

This guide explains how to create custom plugins for the Telegrambo Match extension.

## Architecture Overview

The plugin system in Telegrambo Match works as follows:

1. **Plugin Registration**: When you add a plugin to `setMatch()`, it's initialized once
2. **Event Binding**: The plugin specifies which events it listens to
3. **Context Processing**: When an event occurs, the plugin receives the context
4. **Pattern Matching**: The plugin extracts relevant data and creates a matcher function
5. **Handler Execution**: The matcher function checks patterns and returns the handler result

## Plugin Structure

A plugin is a simple object with two properties:

```js
export default {
  events: ['message', 'channel_post', ...],     // Events to listen to
  plugin: (ctx, eventName) => {                  // Called for each event
    // Logic here
    return (pattern, handler) => {               // Returns matcher function
      // Pattern matching logic
      if (condition) {
        return handler(ctx, extractedValue1, extractedValue2);  // ⚠️ MUST RETURN
      }
    };
  }
}
```

## Key Principles

### 1. **Event Declaration**

The `events` array declares which Telegram events the plugin handles:

```js
events: ['message', 'edited_message', 'channel_post', 'callback_query', ...]
```

### 2. **Plugin Function**

The `plugin` function receives:
- `ctx` - Normalized context object from telegrambo
- `eventName` - String name of the current event

```js
plugin: (ctx, eventName) => {
  // Validate that required data exists
  if (!someRequiredField) return;
  
  // Extract data
  const value = extractData(ctx);
  
  // Return matcher function
  return (pattern, handler) => {
    // Pattern matching logic
  };
}
```

**Important**: If your plugin's conditions aren't met, return `undefined` to skip processing.

### 3. **Matcher Function**

The returned function is called with:
- `pattern` - The pattern to match (string, regex, number, function, etc.)
- `handler` - The user's callback function

```js
return (pattern, handler) => {
  if (patternMatches(pattern)) {
    // ⚠️ CRITICAL: Must return the handler result
    return handler(ctx, extractedValue1, extractedValue2);
  }
}
```

### 4. **Handler Return Value** ⚠️ CRITICAL

**You MUST return the result of calling the handler:**

```js
// ✅ CORRECT
return handler(ctx, value);

// ❌ WRONG - doesn't return
handler(ctx, value);
```

This is essential for compatibility with composite plugins like `all()` and `any()`, which rely on return values to determine if a pattern matched.

### 5. **Pattern Type**

The plugin creator decides:
- What types of patterns are accepted (string, regex, number, function, object, etc.)
- How patterns are validated
- How patterns are matched against data

**Examples of different pattern types:**

```js
// String pattern - exact match
{ text: 'hello' }

// Regex pattern - pattern matching
{ text: /^hello/i }

// Number pattern - exact ID match
{ chat: 123456789 }

// Function pattern - custom logic
{ chat: (id) => id > 0 }

// Array pattern - multiple values
{ media: ['photo', 'video'] }
```

## Implementation Template

```js
export default {
  events: ['message'],                          // 1. Declare events
  plugin: (ctx, eventName) => {
    // 2. Validate required data exists
    if (!ctx.requiredField) return;
    
    // 3. Extract data
    const value = ctx.requiredField;
    
    // 4. Return matcher function
    return (pattern, handler) => {
      // 5. Implement pattern matching logic
      if (typeof pattern === 'string' && pattern === value) {
        // 6. Return handler result (CRITICAL!)
        return handler(ctx, value);
      }
      
      if (pattern instanceof RegExp && pattern.test(value)) {
        return handler(ctx, value);
      }
      
      // Handler not called = undefined returned (OK)
    };
  }
}
```

## Multiple Patterns

If your plugin can match multiple patterns, iterate and handle each:

```js
return (pattern, handler) => {
  for (const item of myItems) {
    if (matchesPattern(item, pattern)) {
      return handler(ctx, item);  // Return on first match
    }
  }
  // If no match, implicitly return undefined
}
```

## Pattern Type Examples

### String Patterns
```js
plugin: (ctx, eventName) => {
  const value = ctx.text;
  if (!value) return;
  
  return (pattern, handler) => {
    // Pattern is a string
    if (typeof pattern === 'string' && pattern === value) {
      return handler(ctx, value);
    }
  };
}
```

### Regex Patterns
```js
plugin: (ctx, eventName) => {
  const value = ctx.text;
  if (!value) return;
  
  return (pattern, handler) => {
    // Pattern is a RegExp
    if (pattern instanceof RegExp && pattern.test(value)) {
      return handler(ctx, value);
    }
  };
}
```

### Number Patterns
```js
plugin: (ctx, eventName) => {
  const chatId = ctx.chat?.id;
  if (chatId === undefined) return;
  
  return (pattern, handler) => {
    // Pattern is a number
    if (typeof pattern === 'number' && pattern === chatId) {
      return handler(ctx, chatId);
    }
  };
}
```

### Function Patterns
```js
plugin: (ctx, eventName) => {
  const chatId = ctx.chat?.id;
  if (chatId === undefined) return;
  
  return (pattern, handler) => {
    // Pattern is a function
    if (typeof pattern === 'function' && pattern(chatId)) {
      return handler(ctx, chatId);
    }
  };
}
```

## Working with Text and Captions

Many plugins work with message text or channel post captions:

```js
plugin: (ctx, eventName) => {
  // Support both message.text and channel_post.caption
  const text = ctx.text || ctx.caption;
  if (!text) return;
  
  return (pattern, handler) => {
    if (typeof pattern === 'string' && pattern === text) {
      return handler(ctx, text);
    }
  };
}
```

## Working with Entities

For plugins that extract entities (mentions, hashtags, etc.):

```js
plugin: (ctx, eventName) => {
  const text = ctx.text || ctx.caption;
  const entities = ctx.entities || ctx.caption_entities;
  
  if (!entities || !text) return;
  
  const foundEntities = [];
  for (const entity of entities) {
    const value = text.slice(entity.offset, entity.offset + entity.length);
    foundEntities.push({ type: entity.type, value });
  }
  
  if (!foundEntities.length) return;
  
  return (pattern, handler) => {
    for (const { type, value } of foundEntities) {
      if (typeof pattern === 'string' && pattern === type) {
        return handler(ctx, type, value);  // Return handler result!
      }
    }
  };
}
```

## Handler Arguments

When calling the handler, pass:
1. **ctx** - Always first argument
2. **extracted values** - Plugin-specific values (text, command, mention, etc.)

Examples:

```js
// Text plugin - passes the text
handler(ctx, text)

// Command plugin - passes the command
handler(ctx, command)

// Entity plugin - passes type and value
handler(ctx, type, value)

// Chat plugin - passes eventName
handler(ctx, eventName)

// Mention plugin - passes the mention
handler(ctx, mention)
```

## Composite Plugins Integration

Composite plugins like `all()` and `any()` rely on return values. Here's how they work:

```js
// all() checks if ALL patterns match
bot.match.all([
  { text: 'hello' },     // Plugin 1: must return handler result
  { chat: 123 }          // Plugin 2: must return handler result
], handler);

// If both return truthy values, handler is called
// If any returns falsy, pattern doesn't match
```

This is why returning the handler result is **critical**:

```js
// ✅ Correct - allows all() and any() to work
return handler(ctx, value);

// ❌ Wrong - breaks all() and any() compatibility
handler(ctx, value);  // No return!
```

## Testing Your Plugin

1. **Basic matching**:
```js
bot.match.yourPlugin('pattern', (ctx, value) => {
  console.log('Matched:', value);
});
```

2. **With different pattern types**:
```js
bot.match.yourPlugin('string', handler);
bot.match.yourPlugin(/regex/, handler);
bot.match.yourPlugin(12345, handler);
bot.match.yourPlugin((val) => true, handler);
```

3. **With composite plugins**:
```js
bot.match.all([
  { yourPlugin: 'pattern' },
  { text: 'hello' }
], handler);
```

## Common Mistakes

### ❌ Mistake 1: Not returning handler result
```js
return (pattern, handler) => {
  if (matches) {
    handler(ctx, value);  // Wrong!
  }
};
```

### ❌ Mistake 2: Not returning from plugin function
```js
plugin: (ctx, eventName) => {
  // Missing: return (pattern, handler) => { ... }
}
```

### ❌ Mistake 3: Calling handler without returning
```js
return (pattern, handler) => {
  if (matches) {
    return;
    handler(ctx, value);  // Never reached!
  }
};
```

## Best Practices

1. **Validate early** - Check for required fields at the start of plugin function
2. **Return undefined for non-matches** - Don't call handler if pattern doesn't match
3. **Support multiple pattern types** - Accept strings, regex, functions where applicable
4. **Work with both text and caption** - Support message.text and channel_post.caption
5. **Extract data cleanly** - Prepare values before returning matcher function
6. **Always return handler result** - Critical for composite plugin compatibility
7. **Document your pattern types** - Clearly state what patterns your plugin accepts

## Example: Complete Plugin

```js
export default {
  events: ['message', 'channel_post'],
  plugin: (ctx, eventName) => {
    // 1. Get text from message or caption
    const text = ctx.text || ctx.caption;
    if (!text) return;
    
    // 2. Return matcher function
    return (pattern, handler) => {
      // 3. Support string patterns
      if (typeof pattern === 'string' && pattern === text) {
        return handler(ctx, text);  // Always return!
      }
      
      // 4. Support regex patterns
      if (pattern instanceof RegExp && pattern.test(text)) {
        return handler(ctx, text);  // Always return!
      }
      
      // 5. Support function patterns
      if (typeof pattern === 'function' && pattern(text)) {
        return handler(ctx, text);  // Always return!
      }
      
      // No match - undefined is implicitly returned
    };
  }
}
```

This plugin:
- ✅ Supports text and caption
- ✅ Accepts string, regex, and function patterns
- ✅ Always returns handler result
- ✅ Compatible with all() and any()
