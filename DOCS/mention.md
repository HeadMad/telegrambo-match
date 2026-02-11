# Mention Matcher

Match @username mentions in messages.

## Plugin Structure

```js
export default {
  events: ['message'],
  plugin: (ctx, check, eventName) => {
    if (!('entities' in ctx) || !ctx.text)
      return;

    for (const entity of ctx.entities) {
      if (entity.type === 'mention') {
        const value = ctx.text.slice(entity.offset, entity.offset + entity.length);
        check(value)(ctx, value);
      }
    }
  }
}
```

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
  console.log('Mentioned:', mention);
});

bot.match.mention('@admin', (ctx, mention) => {
  ctx.sendMessage({ text: `You mentioned ${mention}!` });
});
```

## Handler Parameters

- `ctx` - The context object with message data
- `mention` - The mentioned username including @ (e.g., `@username`)

## How It Works

The mention matcher:
1. Checks if the message contains `mention` entities
2. Extracts the mention text from the message using entity offset and length
3. Calls registered handlers for matching mentions
4. All matching handlers are called (not just the first one)

## Examples

### Detect Specific Mention

```js
bot.match.mention('@admin', (ctx, mention) => {
  ctx.sendMessage({ text: 'Admin was mentioned!' });
});
```

### Log All Mentions

```js
bot.match.mention('@', (ctx, mention) => {
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
bot.match.mention('@', (ctx, mention) => {
  // In a group, notify admins of mentions
  if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
    console.log(`${ctx.from.username} mentioned ${mention} in ${ctx.chat.title}`);
  }
});
```

### Regex Pattern Matching

```js
// Match any mention (using regex)
bot.match.mention(/@\w+/, (ctx, mention) => {
  ctx.sendMessage({ text: `Found mention: ${mention}` });
});
```

## Message Structure

When a message contains mentions, Telegram provides entity data:

```js
{
  text: "Hey @admin and @support check this out",
  entities: [
    { type: "mention", offset: 4, length: 6 },   // @admin
    { type: "mention", offset: 15, length: 8 }   // @support
  ]
}
```

The mention matcher extracts these automatically.

## Common Patterns

### Mention Notification System

```js
const mentionedUsers = new Set();

bot.match.mention(/@\w+/, (ctx, mention) => {
  mentionedUsers.add(mention);
  
  if (mentionedUsers.size >= 3) {
    ctx.sendMessage({ text: 'Too many mentions!' });
    mentionedUsers.clear();
  }
});
```

### Mention Reply

```js
bot.match.mention('@me', (ctx, mention) => {
  ctx.sendMessage({ text: 'Yes, I am here! 👋' });
});
```

### Mention Counter

```js
const mentionStats = {};

bot.match.mention(/@\w+/, (ctx, mention) => {
  mentionStats[mention] = (mentionStats[mention] || 0) + 1;
});
```

### Conditional Mention Handler

```js
bot.match.mention('@admin', (ctx, mention) => {
  // Check if user is authorized to mention admin
  if (ctx.from.id === ADMIN_ID) {
    ctx.sendMessage({ text: 'Admin already here!' });
  } else {
    ctx.sendMessage({ text: 'Admin has been notified' });
    // Send notification to admin
  }
});
```

## Entity Structure

Telegram provides mention entities with:
- `type` - Always "mention" for this matcher
- `offset` - Position in text where mention starts
- `length` - Length of the mention text (including @)

## Notes

- Mentions must start with `@` character
- Mentions are case-sensitive in matching
- Multiple mentions in one message trigger handler multiple times
- Works in private chats, groups, and channels
- Requires message to have text and entities
- The mention includes the @ symbol
