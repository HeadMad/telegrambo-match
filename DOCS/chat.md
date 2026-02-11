# Chat Matcher

Match messages and events by chat ID. Works with all event types (not just messages).

## Plugin Structure

```js
export default {
  events: ['message', 'edited_message', 'channel_post', 'edited_channel_post', 'callback_query', 'my_chat_member', 'chat_member', 'chat_join_request'],
  plugin: (ctx, check, eventName) => {
    if (ctx.chat && ctx.chat.id !== undefined) {
      const chatId = ctx.chat.id;
      check(chatId)(ctx, eventName);
    }
  }
}
```

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
// Match specific chat by ID
bot.match.chat(123456789, (ctx, eventName) => {
  console.log(`Received event "${eventName}" in chat ${ctx.chat.id}`);
});

// Match multiple chats using regex
bot.match.chat(/^-100/, (ctx, eventName) => {
  console.log(`Received in supergroup/channel: ${ctx.chat.id}`);
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
- ✅ String pattern matching (exact chat ID)
- ✅ Regular expression matching (for multiple chats)
- ✅ Access to chat info via `ctx.chat`
- ✅ Supports chaining

## Examples

### Match specific chat
```js
match.chat(123456789, (ctx, eventName) => {
  console.log(`Message in my chat: ${ctx.text}`);
});
```

### Match supergroups and channels
```js
match.chat(/^-100/, (ctx, eventName) => {
  console.log(`Supergroup/channel event: ${eventName}`);
});
```

### Match private chats
```js
bot.match.chat(ctx => ctx.chat.type === 'private', (ctx, eventName) => {
  ctx.sendMessage({ text: 'This is a private chat' });
});
```

### Multiple chats with chaining
```js
match
  .chat(123456789, (ctx, evt) => { /* admin chat */ })
  .chat(987654321, (ctx, evt) => { /* support chat */ })
  .chat(-100111222333, (ctx, evt) => { /* channel */ });
```

### Track bot status in groups
```js
match.chat(/^-100/, (ctx, eventName) => {
  if (eventName === 'my_chat_member') {
    console.log(`Bot status changed: ${ctx.my_chat_member.new_chat_member.status}`);
  }
});
```

## Chat ID Formats

- **Private chats**: Positive numbers (e.g., `123456789`)
- **Groups**: Negative numbers (e.g., `-123456789`)
- **Supergroups/Channels**: Negative with prefix (e.g., `-100123456789`)

## Notes

- Chat matcher works across all event types, not limited to messages
- Access chat information via `ctx.chat` property
- Use regex patterns to match multiple chats with similar IDs
- Useful for logging, admin panels, and per-chat configuration
