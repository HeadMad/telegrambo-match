# Command Matcher

Match Telegram bot commands (e.g., `/start`, `/help`). Works with messages and channel posts.

## Supported Pattern Types

- **String**: Exact command match
  ```js
  { command: '/start' }
  ```
- **RegExp**: Regex pattern matching
  ```js
  { command: /^\/help/ }
  ```

## Plugin Structure

```js
export default {
  events: ['message', 'channel_post'],
  plugin: (ctx, eventName, plugins) => {
    const text = ctx.text || ctx.caption;
    const entities = ctx.entities || ctx.caption_entities;

    if (!entities || !text) return;

    for (const entity of entities) {
      if (entity.type === 'bot_command' && entity.offset === 0) {
        const command = text.slice(entity.offset, entity.offset + entity.length);

        // Return matcher function (MUST return handler result)
        return (pattern, handler) => {
          if (typeof pattern === 'string' && pattern === command)
            return handler(ctx, command);  // ⚠️ MUST return
          
          if (pattern instanceof RegExp && pattern.test(command))
            return handler(ctx, command);  // ⚠️ MUST return
        };
      }
    }
  }
}
```

⚠️ **Important**: Handler result MUST be returned for compatibility with composite plugins like `all()` and `any()`.

## Initialization

```js
import setMatch, { command } from 'telegrambo-match';

const bot = telegrambo(process.env.BOT_TOKEN);
bot.match = setMatch({
  command
});
```

## Usage

```js
bot.match.command('/start', (ctx, command) => {
  ctx.sendMessage({ text: 'Welcome to the bot!' });
});

bot.match.command('/help', (ctx, command) => {
  ctx.sendMessage({ text: 'How can I help you?' });
});
```

## Handler Parameters

- `ctx` - The context object with message data
- `command` - The matched command string (e.g., `/start`)

## Features

- ✅ Exact command matching (string patterns)
- ✅ Regex pattern matching
- ✅ Requires `bot_command` entity at offset 0 (beginning of message)
- ✅ Works with messages and channel post captions
- ✅ Supports chaining multiple commands

## How it Works

The command matcher:
1. Checks if the message/caption has entities
2. Looks for a `bot_command` entity at the very start (offset 0)
3. Extracts the command text
4. Matches it against registered patterns
5. Calls the handler if pattern matches

## Examples

### Basic command

```js
bot.match.command('/start', (ctx, command) => {
  ctx.sendMessage({ text: 'Welcome!' });
});
```

### Multiple commands with chaining

```js
bot.match
  .command('/start', (ctx, cmd) => { 
    ctx.sendMessage({ text: 'Welcome!' }); 
  })
  .command('/help', (ctx, cmd) => { 
    ctx.sendMessage({ text: 'Need help?' }); 
  })
  .command('/stop', (ctx, cmd) => { 
    ctx.sendMessage({ text: 'Goodbye!' }); 
  });
```

### Regex pattern matching

```js
bot.match.command(/^\/help/, (ctx, command) => {
  ctx.sendMessage({ text: 'Help documentation...' });
});
```

### Command with parameters

```js
bot.match.command('/search', (ctx, command) => {
  const args = ctx.text.slice(command.length).trim().split(' ');
  ctx.sendMessage({ text: `Searching for: ${args.join(' ')}` });
});
```

### With composite plugin

```js
// Only respond to /admin command in specific chat
bot.match.all([
  { command: '/admin' },
  { chat: ADMIN_CHAT_ID }
], (ctx) => {
  ctx.sendMessage({ text: 'Admin panel' });
});
```

## Notes

- Commands are recognized only at the beginning of a message (offset 0)
- Command string includes the `/` character
- Requires Telegram to recognize the message as containing a `bot_command` entity
- Works with both message text and channel post captions
