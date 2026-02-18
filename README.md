# Telegrambo Match

A powerful matching extension for the Telegrambo library that provides flexible pattern matching for Telegram bot messages. Supports matching by text patterns, commands, and message entity types.

<br>

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Available Plugins](#available-plugins)
- [Quick Plugin Examples](#quick-plugin-examples)
- [Chaining](#chaining)
- [Plugin Development Guide](#plugin-development-guide)

<br>

## Installation

You can install Telegrambo Match using npm:

```
npm install telegrambo-match
```

<br>

## Quick Start

```js
// bot.js

import telegrambo from 'telegrambo';
import setMatch, { text, command, entity, chat, similarity } from 'telegrambo-match';

const bot = telegrambo(process.env.YOUR_BOT_TOKEN);

// Initialize match system with plugins
bot.match = setMatch({
  text,
  command,
  entity,
  chat,
  similarity({ threshold: 0.75, caseInsensitive: true })
});

// Now you can use match methods
bot.match.text('hello', (ctx, text) => {
  ctx.reply('Hello there!');
});

bot.match.command('/start', (ctx, command) => {
  ctx.reply('Welcome!');
});

bot.match.chat(123456789, (ctx, eventName) => {
  console.log(`Received ${eventName} in chat ${ctx.chat.id}`);
});

// Similarity matching with typo tolerance
bot.match.similarity('help', (ctx, text, score) => {
  ctx.reply(`Help requested (${(score * 100).toFixed(1)}% match)`);
});
```

<br>

## Available Plugins

| Plugin | Description | Config | Docs |
|--------|-------------|--------|------|
| `text` | Match by text patterns (string or regex) | No | [DOCS/text.md](DOCS/text.md) |
| `command` | Match Telegram bot commands | No | [DOCS/command.md](DOCS/command.md) |
| `entity` | Match by entity types (mention, hashtag, etc.) | No | [DOCS/entity.md](DOCS/entity.md) |
| `chat` | Match by chat ID or across all event types | No | [DOCS/chat.md](DOCS/chat.md) |
| `similarity` | Fuzzy text matching with threshold | Yes | [DOCS/similarity.md](DOCS/similarity.md) |
| `media` | Match by media type (photo, video, audio, etc.) | No | [DOCS/media.md](DOCS/media.md) |
| `mention` | Match @username mentions | No | [DOCS/mention.md](DOCS/mention.md) |
| `hashtag` | Match #hashtags | No | [DOCS/hashtag.md](DOCS/hashtag.md) |
| `callbackQuery` | Match callback queries from inline buttons | No | [DOCS/callbackQuery.md](DOCS/callbackQuery.md) |
| `chatMember` | Match chat member status changes | No | [DOCS/chatMember.md](DOCS/chatMember.md) |

### Quick Plugin Examples

For detailed documentation on each plugin, visit the links in the [Available Plugins](#available-plugins) section.

**Text Matcher** — [DOCS/text.md](DOCS/text.md)
```js
match.text('hello', (ctx, text) => { /* ... */ });
match.text(/^start/i, (ctx, text) => { /* ... */ });
```

**Command Matcher** — [DOCS/command.md](DOCS/command.md)
```js
match.command('/start', (ctx, command) => { /* ... */ });
match.command('/help', (ctx, command) => { /* ... */ });
```

**Entity Matcher** — [DOCS/entity.md](DOCS/entity.md)
```js
match.entity('mention', (ctx, type, value) => { /* ... */ });
match.entity('hashtag', (ctx, type, value) => { /* ... */ });
```

**Chat Matcher** — [DOCS/chat.md](DOCS/chat.md)
```js
match.chat(123456789, (ctx, eventName) => { /* ... */ });
match.chat(/^-100/, (ctx, eventName) => { /* ... */ });
```

**Similarity Matcher** — [DOCS/similarity.md](DOCS/similarity.md)
```js
const match = setMatch({
  similarity({ threshold: 0.75, caseInsensitive: true })
});

match.similarity('hello', (ctx, text, score) => { /* ... */ });
```

**Media Matcher** — [DOCS/media.md](DOCS/media.md)
```js
match.media('photo', (ctx, type) => { /* ... */ });
match.media('video', (ctx, type) => { /* ... */ });
```

**Mention Matcher** — [DOCS/mention.md](DOCS/mention.md)
```js
match.mention('@username', (ctx, mention) => { /* ... */ });
match.mention('@admin', (ctx, mention) => { /* ... */ });
```

**Hashtag Matcher** — [DOCS/hashtag.md](DOCS/hashtag.md)
```js
match.hashtag('#python', (ctx, tag) => { /* ... */ });
match.hashtag('#help', (ctx, tag) => { /* ... */ });
```

**Callback Query Matcher** — [DOCS/callbackQuery.md](DOCS/callbackQuery.md)
```js
match.callbackQuery('like', (ctx) => { /* ... */ });
match.callbackQuery('delete', (ctx, itemId) => { /* ... */ });
```

**Chat Member Matcher** — [DOCS/chatMember.md](DOCS/chatMember.md)
```js
match.chatMember('member', (ctx, status) => { /* ... */ });
match.chatMember('left', (ctx, status) => { /* ... */ });
```

## Chaining

All matchers support chaining:

```js
match
  .text('hello', handler1)
  .text(/world/, handler2)
  .command('/start', handler3)
  .entity('mention', handler4)
  .chat(123456789, handler5);
```

## Plugin Development Guide

This section explains how to create custom plugins for the Telegrambo Match extension.

### Plugin Structure

A plugin is an object with event declarations and a handler function:

```js
export default {
  events: ['message', 'edited_message'],
  plugin: (ctx, eventName, plugins) => {
    // Plugin implementation
  }
}
```

**Properties:**
- `events` (array) - List of event types this plugin listens to
- `plugin` (function) - Handler function that runs for each declared event

**Plugin function parameters:**
- `ctx` - The context object with update data
- `eventName` - The name of the current event
- `plugins` - An object with all registered plugins (for cross-plugin interactions)

### How It Works

1. **Event Declaration**: Plugin declares which events it handles
   ```js
   events: ['message', 'edited_message', 'callback_query']
   ```

2. **Centralized Subscription**: `setMatch()` creates a single bot subscription for all events
   ```js
   bot.on((ctx, eventName) => {
     // Routes events to relevant plugins
   });
   ```

3. **Pattern Matching**: Plugin extracts the value to match from the context and returns a matcher function
4. **Matcher Function**: The returned function checks if pattern matches the value
5. **Execute Handlers**: If match succeeds, handler is executed with context and matched values

### Example Plugin: Text Matcher

```js
export default {
  events: ['message'],
  plugin: (ctx, eventName, plugins) => {
    // Check if message has text
    if ('text' in ctx) {
      // Create matcher for this text value and execute handlers
      return (pattern, handler) => {
        if (typeof pattern === 'string' && pattern === ctx.text) {
          return handler(ctx, ctx.text);
        }
      };
    }
  }
}
```

### Key Principles

1. **Declare Events**: Always specify which events your plugin handles in the `events` array
2. **Single Responsibility**: Each plugin should handle one type of matching
3. **Event Awareness**: Use `eventName` parameter to handle different event types if needed
4. **Handler Arguments**: Pass context as first argument, then the matched value(s)
5. **Pattern Support**: Support both string/number patterns and regex patterns
6. **No Side Effects**: Plugin should not call `bot.on()` - that's handled by `setMatch()`
7. **Return Matcher Function**: Always return a function that checks patterns and calls handlers

### Factory Plugins

Some plugins accept configuration options. These are **factory plugins** that return the plugin configuration:

```js
// Factory plugin that accepts options
export default (options = {}) => {
  const { threshold = 0.8, caseInsensitive = false } = options;
  
  // Return the plugin configuration
  return {
    events: ['message'],
    plugin: (ctx, eventName, plugins) => {
      // Implementation using options
    }
  };
};
```

Usage in setMatch:
```js
const match = setMatch({
  text,
  similarity: similarity({ threshold: 0.75 })  // Pass options to factory
})(bot);
```

The key difference:
- **Regular plugins**: `plugin` (plugin object, passed directly)
- **Factory plugins**: `plugin(options)` (called with options, returns the plugin object)

### Plugin Registration

To add your plugin to the `setMatch()` system:

1. Create your plugin file in `src/` directory
2. Export it as default export
3. Add it to `index.js` exports
4. Include it in the plugins object when initializing:
   ```js
   const match = setMatch({
     text,
     command,
     entity,
     chat,
     yourPlugin,  // Regular plugin
     similarity: similarity({ threshold: 0.8 })  // Factory plugin
   })(bot);
   ```

### Testing Your Plugin

Test your plugin by:
1. Registering handlers with different patterns
2. Ensuring handlers are called with correct arguments
3. Verifying chainability works as expected
4. Testing edge cases and invalid inputs