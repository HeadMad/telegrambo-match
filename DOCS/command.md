# Command Matcher

Match Telegram bot commands (messages starting with `/`).

## Plugin Structure

```js
export default {
  events: ['message'],
  plugin: (ctx, check, eventName) => {
    if (!ctx.entities || !ctx.text)
      return;

    for (const entity of ctx.entities) {
      if (entity.type === 'bot_command' && entity.offset === 0) {
        const command = ctx.text.slice(entity.offset, entity.offset + entity.length);
        return check(command)(ctx, command);
      }
    }
  }
}
```

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
  console.log('Start command received:', command);
});

bot.match.command('/help', (ctx, command) => {
  console.log('Help command received:', command);
});
```

## Handler Parameters

- `ctx` - The context object with message data
- `command` - The matched command string (e.g., `/start`)

## Features

- ✅ Exact command matching
- ✅ Requires `bot_command` entity at offset 0
- ✅ Full command string including `/`
- ✅ Supports chaining multiple commands

## How it Works

The command matcher looks for Telegram `bot_command` entities at the beginning of a message (offset 0). It extracts the command text and matches it against registered patterns.

## Examples

### Basic command
```js
bot.match.command('/start', (ctx, command) => {
  ctx.sendMessage({ text: 'Welcome to the bot!' });
});
```

### Multiple commands with chaining
```js
bot.match
  .command('/start', (ctx, cmd) => { ctx.sendMessage({ text: 'Welcome!' }); })
  .command('/help', (ctx, cmd) => { ctx.sendMessage({ text: 'Need help?' }); })
  .command('/stop', (ctx, cmd) => { ctx.sendMessage({ text: 'Goodbye!' }); });
```

### Command with parameters
```js
bot.match.command('/search', (ctx, command) => {
  const args = ctx.text.slice(command.length).trim().split(' ');
  ctx.sendMessage({ text: `Searching for: ${args.join(' ')}` });
});
```

## Notes

- Only matches commands at the start of a message (offset 0)
- Command string includes the `/` character
- Requires Telegram to recognize the message as containing a `bot_command` entity
