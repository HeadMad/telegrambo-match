# Mention Matcher

Match @username mentions in messages and captions.

## Supported Pattern Types

- **String**: Exact mention match
  ```js
  { mention: '@username' }
  ```
- **RegExp**: Regex pattern matching
  ```js
  { mention: /@admin/ }
  ```

## Plugin Structure

```js
export default {
  events: ['message', 'channel_post'],
  plugin: (ctx, eventName, plugins) => {
    const text = ctx.text || ctx.caption;
    const entities = ctx.entities || ctx.caption_entities;

    if (!entities || !text) return;

    const foundMentions = [];
    
    for (const entity of entities) {
      if (entity.type === 'mention') {
        const value = text.slice(entity.offset, entity.offset + entity.length);
        foundMentions.push(value);
      }
    }

    if (!foundMentions.length) return;

    // Return matcher function (MUST return handler result)
    return (pattern, handler) => {
      for (const mention of foundMentions) {
        if (typeof pattern === 'string' && pattern === mention)
          return handler(ctx, mention);  // ⚠️ MUST return
        
        if (pattern instanceof RegExp && pattern.test(mention))
          return handler(ctx, mention);  // ⚠️ MUST return
      }
    };
  }
}
```

⚠️ **Important**: Handler result MUST be returned for compatibility with composite plugins like `all()` and `any()`.

## Initialization

```js
import setMatch, { mention } from 'telegrambo-match';

const bot = telegrambo(process.env.BOT_TOKEN);
bot.match = setMatch({
  mention
});
```

## Usage

```js
bot.match.mention('@username', (ctx, mention) => {
  ctx.sendMessage({ text: `You mentioned: ${mention}` });
});

bot.match.mention('@admin', (ctx, mention) => {
  ctx.sendMessage({ text: 'Admin notification sent' });
});
```

## Handler Parameters

- `ctx` - The context object with message data
- `mention` - The mentioned username including @ (e.g., `@username`)

## Examples

### Detect Specific Mention

```js
bot.match.mention('@admin', (ctx, mention) => {
  ctx.sendMessage({ text: 'Admin was mentioned!' });
});
```

### Log All Mentions

```js
bot.match.mention(/@\w+/, (ctx, mention) => {
  console.log(`User mentioned: ${mention}`);
});
```

### Multiple Mentions with Chaining

```js
bot.match
  .mention('@admin', (ctx, mention) => {
    ctx.sendMessage({ text: 'You mentioned admin!' });
  })
  .mention('@support', (ctx, mention) => {
    ctx.sendMessage({ text: 'You mentioned support team!' });
  })
  .mention('@bot', (ctx, mention) => {
    ctx.sendMessage({ text: 'You mentioned a bot!' });
  });
```

### Mention in Group Chat

```js
bot.match.mention(/@\w+/, (ctx, mention) => {
  if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
    console.log(`${ctx.from.username} mentioned ${mention} in ${ctx.chat.title}`);
  }
});
```

### Regex Pattern Matching

```js
// Match any mention
bot.match.mention(/@\w+/, (ctx, mention) => {
  ctx.sendMessage({ text: `Found mention: ${mention}` });
});
```

### With composite plugin

```js
// Match mentions only in specific chat
bot.match.all([
  { mention: /@admin/ },
  { chat: GROUP_CHAT_ID }
], (ctx, mention) => {
  ctx.sendMessage({ text: `Admin mentioned in group: ${mention}` });
});
```

## Notes

- Mentions must start with `@` character
- Mentions are case-sensitive in matching
- Multiple mentions in one message trigger the handler multiple times
- Works in private chats, groups, and channels
- Works with both message text and channel post captions
