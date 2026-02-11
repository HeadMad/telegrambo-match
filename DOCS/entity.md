# Entity Matcher

Match messages by Telegram entity types. Extracts entity values from message text.

## Plugin Structure

```js
export default {
  events: ['message'],
  plugin: (ctx, check, eventName) => {
    if (!('entities' in ctx) || !ctx.text)
      return;

    for (const entity of ctx.entities) {
      const value = ctx.text.slice(entity.offset, entity.offset + entity.length);
      check(entity.type)(ctx, entity.type, value);
    }
  }
}
```

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
bot.match.entity('bot_command', (ctx, type, value) => {
  console.log('Bot command:', value);
});

bot.match.entity('mention', (ctx, type, value) => {
  console.log('Mentioned user:', value);
});

bot.match.entity('hashtag', (ctx, type, value) => {
  console.log('Hashtag:', value);
});
```

## Handler Parameters

- `ctx` - The context object with message data
- `type` - The entity type (e.g., `mention`, `hashtag`, `bot_command`)
- `value` - The actual text of the entity extracted from the message

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

## How it Works

The entity matcher:
1. Checks if the message contains entities
2. For each entity found, extracts its value from the message text using `offset` and `length`
3. Calls registered handlers for matching entity types
4. All matching handlers are called (unlike other matchers that stop at first match)

## Notes

- Multiple entities of the same type in one message will trigger the handler multiple times
- Entity value is extracted directly from message text
- Useful for parsing user input, detecting links, mentions, etc.
- Works with all Telegram message entity types
