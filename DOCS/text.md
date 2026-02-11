# Text Matcher

Match messages by text patterns (strings or regular expressions).

## Plugin Structure

```js
export default {
  events: ['message'],
  plugin: (ctx, check, eventName) => {
    if ('text' in ctx) {
      return check(ctx.text)(ctx, ctx.text);
    }
  }
}
```

## Initialization

```js
import setMatch, { text } from 'telegrambo-match';

const bot = telegrambo(process.env.BOT_TOKEN);
bot.match = setMatch({
  text
});
```

## Usage

```js
bot.match.text('hello', (ctx, text) => {
  console.log('Matched text:', text);
});

bot.match.text(/^start/i, (ctx, text) => {
  console.log('Matched regex:', text);
});
```

## Handler Parameters

- `ctx` - The context object with message data
- `text` - The matched message text

## Features

- ✅ String pattern matching
- ✅ Regular expression matching
- ✅ Case-sensitive by default
- ✅ Supports chaining multiple patterns

## Examples

### Exact string match
```js
bot.match.text('ping', (ctx, text) => {
  ctx.sendMessage({ text: 'pong' });
});
```

### Case-insensitive regex
```js
bot.match.text(/hello/i, (ctx, text) => {
  ctx.sendMessage({ text: 'Hi there!' });
});
```

### Multiple patterns with chaining
```js
match
  .text('hello', handler1)
  .text(/world/, handler2)
  .text('test', handler3);
```

## Notes

- String matching is case-sensitive
- Use regex with `i` flag for case-insensitive matching
- Each pattern can have only one handler (later registrations override earlier ones)
