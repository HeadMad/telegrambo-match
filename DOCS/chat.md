# Chat Matcher

Match messages and events by chat ID. Works with all event types (not just messages).

## Supported Pattern Types

- **Number**: Exact chat ID match
  ```js
  { chat: 123456789 }
  ```
- **String**: Chat ID as string
  ```js
  { chat: '123456789' }
  ```
- **RegExp**: Regex pattern matching against chat ID (as string)
  ```js
  { chat: /^-100/ }  // Supergroups and channels
  ```
- **Function**: Custom matching logic
  ```js
  { chat: (id) => id > 0 }  // Private chats only
  ```

## Plugin Structure

```js
export default {
  events: ['message', 'edited_message', 'channel_post', 'edited_channel_post', 'callback_query', 'my_chat_member', 'chat_member', 'chat_join_request'],
  plugin: (ctx, eventName, plugins) => {
    if (!ctx.chat || ctx.chat.id === undefined)
      return;

    const chatId = ctx.chat.id;

    // Return matcher function (MUST return handler result)
    return (pattern, handler) => {
      if (typeof pattern === 'number' && pattern === chatId)
        return handler(ctx, eventName);  // ⚠️ MUST return
      
      if (typeof pattern === 'string' && pattern === String(chatId))
        return handler(ctx, eventName);  // ⚠️ MUST return
      
      if (pattern instanceof RegExp && pattern.test(String(chatId)))
        return handler(ctx, eventName);  // ⚠️ MUST return
      
      if (typeof pattern === 'function' && pattern(chatId))
        return handler(ctx, eventName);  // ⚠️ MUST return
    };
  }
}
```

⚠️ **Important**: Handler result MUST be returned for compatibility with composite plugins like `all()` and `any()`.

## Initialization

```js
import setMatch, { chat } from 'telegrambo-match';

const bot = telegrambo(process.env.BOT_TOKEN);
bot.match = setMatch({
  chat
});
```

## Usage

```js
// Match specific chat by ID (number)
bot.match.chat(123456789, (ctx, eventName) => {
  console.log(`Received event "${eventName}" in chat ${ctx.chat.id}`);
});

// Match multiple chats using regex
bot.match.chat(/^-100/, (ctx, eventName) => {
  console.log(`Received in supergroup/channel: ${ctx.chat.id}`);
});

// Match with function
bot.match.chat((id) => id > 0, (ctx, eventName) => {
  console.log(`Private chat: ${ctx.chat.id}`);
});
```

## Handler Parameters

- `ctx` - The context object with normalized update data
- `eventName` - The type of event that triggered the handler

## Supported Events

- `message` - Regular messages
- `edited_message` - Edited messages
- `channel_post` - Channel posts
- `edited_channel_post` - Edited channel posts
- `callback_query` - Callback queries from inline buttons
- `my_chat_member` - Bot added/removed from chat
- `chat_member` - User added/removed from chat
- `chat_join_request` - User requests to join chat

## Features

- ✅ Works with all event types (not just messages)
- ✅ Number pattern matching (exact chat ID)
- ✅ String pattern matching
- ✅ Regular expression matching (for multiple chats)
- ✅ Function pattern matching (custom logic)
- ✅ Access to chat info via `ctx.chat`
- ✅ Supports chaining

## Examples

### Match specific chat

```js
bot.match.chat(123456789, (ctx, eventName) => {
  ctx.sendMessage({ text: 'Message in my chat' });
});
```

### Match supergroups and channels

```js
bot.match.chat(/^-100/, (ctx, eventName) => {
  console.log(`Supergroup/channel event: ${eventName}`);
});
```

### Match private chats only

```js
bot.match.chat((id) => id > 0, (ctx, eventName) => {
  ctx.sendMessage({ text: 'This is a private chat' });
});
```

### Multiple chats with chaining

```js
bot.match
  .chat(123456789, (ctx, evt) => { 
    // Admin chat 
  })
  .chat(987654321, (ctx, evt) => { 
    // Support chat 
  })
  .chat(-100111222333, (ctx, evt) => { 
    // Channel 
  });
```

### Track bot status in groups

```js
bot.match.chat(/^-100/, (ctx, eventName) => {
  if (eventName === 'my_chat_member') {
    const status = ctx.new_chat_member.status;
    console.log(`Bot status in supergroup: ${status}`);
  }
});
```

### With composite plugin

```js
// Match messages in specific chat AND contain text "secret"
bot.match.all([
  { text: 'secret' },
  { chat: 123456789 }
], (ctx) => {
  ctx.sendMessage({ text: 'Secret message received' });
});
```

## Chat ID Formats

- **Private chats**: Positive numbers (e.g., `123456789`)
- **Groups**: Negative numbers (e.g., `-123456789`)
- **Supergroups/Channels**: Negative with 100 prefix (e.g., `-100123456789`)

## Notes

- Chat matcher works across all event types, not limited to messages
- Access chat information via `ctx.chat` property
- Use regex patterns to match multiple chats with similar IDs
- Use functions for complex matching logic
- Useful for logging, admin panels, and per-chat configuration
