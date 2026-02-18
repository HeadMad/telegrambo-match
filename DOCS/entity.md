# Entity Matcher

Match messages by Telegram entity types. Extracts entity values from message text or captions.

## Supported Pattern Types

- **String**: Exact entity type match
  ```js
  { entity: 'mention' }
  { entity: 'hashtag' }
  { entity: 'url' }
  ```
- **RegExp**: Regex pattern matching against entity type
  ```js
  { entity: /mention|hashtag/ }
  ```

## Plugin Structure

```js
export default {
  events: ['message', 'channel_post'],
  plugin: (ctx, eventName, plugins) => {
    const text = ctx.text || ctx.caption;
    const entities = ctx.entities || ctx.caption_entities;

    if (!entities || !text) return;

    const foundEntities = [];
    
    for (const entity of entities) {
      const value = text.slice(entity.offset, entity.offset + entity.length);
      foundEntities.push({ type: entity.type, value });
    }

    if (!foundEntities.length) return;

    // Return matcher function (MUST return handler result)
    return (pattern, handler) => {
      for (const { type, value } of foundEntities) {
        if (typeof pattern === 'string' && pattern === type)
          return handler(ctx, type, value);  // ⚠️ MUST return
        
        if (pattern instanceof RegExp && pattern.test(type))
          return handler(ctx, type, value);  // ⚠️ MUST return
      }
    };
  }
}
```

⚠️ **Important**: Handler result MUST be returned for compatibility with composite plugins like `all()` and `any()`.

## Initialization

```js
import setMatch, { entity } from 'telegrambo-match';

const bot = telegrambo(process.env.BOT_TOKEN);
bot.match = setMatch({
  entity
});
```

## Usage

```js
bot.match.entity('mention', (ctx, type, value) => {
  ctx.sendMessage({ text: `You mentioned: ${value}` });
});

bot.match.entity('hashtag', (ctx, type, value) => {
  ctx.sendMessage({ text: `Hashtag: ${value}` });
});
```

## Handler Parameters

- `ctx` - The context object with message data
- `type` - The entity type (e.g., `mention`, `hashtag`, `url`)
- `value` - The actual text of the entity extracted from the message/caption

## Supported Entity Types

- `mention` - @username mentions
- `hashtag` - #hashtags
- `cashtag` - $symbols (for cryptocurrencies)
- `bot_command` - /commands
- `url` - URLs and links
- `email` - Email addresses
- `phone_number` - Phone numbers
- `bold` - Bold text (formatting)
- `italic` - Italic text (formatting)
- `code` - Inline code (formatting)
- `pre` - Code block (formatting)
- `text_link` - Clickable text with URL
- `text_mention` - User mention without @
- `underline` - Underlined text (formatting)
- `strikethrough` - Strikethrough text (formatting)

## Examples

### Detect mentions

```js
bot.match.entity('mention', (ctx, type, value) => {
  ctx.sendMessage({ text: `You mentioned: ${value}` });
});
```

### Detect hashtags

```js
bot.match.entity('hashtag', (ctx, type, value) => {
  ctx.sendMessage({ text: `Hashtag found: ${value}` });
});
```

### Detect URLs

```js
bot.match.entity('url', (ctx, type, value) => {
  ctx.sendMessage({ text: `Link shared: ${value}` });
});
```

### Multiple entity types with chaining

```js
bot.match
  .entity('mention', (ctx, type, value) => {
    ctx.sendMessage({ text: `@user: ${value}` });
  })
  .entity('hashtag', (ctx, type, value) => {
    ctx.sendMessage({ text: `#tag: ${value}` });
  })
  .entity('url', (ctx, type, value) => {
    ctx.sendMessage({ text: `URL: ${value}` });
  });
```

### Regex pattern matching

```js
bot.match.entity(/mention|hashtag/, (ctx, type, value) => {
  ctx.sendMessage({ text: `Found ${type}: ${value}` });
});
```

### With composite plugin

```js
// Match hashtags only in public channels
bot.match.all([
  { entity: 'hashtag' },
  { chat: /^-100/ }  // Supergroups and channels
], (ctx, type, value) => {
  ctx.sendMessage({ text: `Channel hashtag: ${value}` });
});
```

## How it Works

The entity matcher:
1. Checks if the message/caption contains entities
2. For each entity, extracts its value from the text using offset and length
3. Matches entity types against registered patterns
4. Calls the handler for each matching entity found

## Notes

- Multiple entities of the same type in one message will trigger the handler multiple times
- Entity value is extracted directly from message text or caption
- Useful for parsing user input, detecting links, mentions, etc.
- Works with all Telegram message entity types
- Works with both message text and channel post captions
