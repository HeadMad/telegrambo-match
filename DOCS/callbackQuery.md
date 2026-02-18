# Callback Query Matcher

Match callback queries from inline buttons. Supports action parsing with optional parameters.

## Supported Pattern Types

- **String**: Exact action match
  ```js
  { callbackQuery: 'delete' }
  { callbackQuery: 'like[42]' }  // With parameters in data
  ```
- **RegExp**: Regex pattern matching against action name
  ```js
  { callbackQuery: /^edit_/ }
  ```

## Plugin Structure

```js
export default {
  events: ['callback_query'],
  plugin: (ctx, eventName, plugins) => {
    if (!ctx.data) return;

    const data = ctx.data;
    let action = data;
    let params = [];

    const offset = data.indexOf('[');

    if (offset !== -1) {
      action = data.substring(0, offset);
      params = JSON.parse(data.substring(offset));
    }

    // Return matcher function (MUST return handler result)
    return (pattern, handler) => {
      const trimmedAction = action.trim();
      
      if (typeof pattern === 'string' && pattern === trimmedAction)
        return handler(ctx, ...params);  // ⚠️ MUST return
      
      if (pattern instanceof RegExp && pattern.test(trimmedAction))
        return handler(ctx, ...params);  // ⚠️ MUST return
    };
  }
}
```

⚠️ **Important**: Handler result MUST be returned for compatibility with composite plugins like `all()` and `any()`.

## Initialization

```js
import setMatch, { callbackQuery } from 'telegrambo-match';

const bot = telegrambo(process.env.BOT_TOKEN);
bot.match = setMatch({
  callbackQuery
});
```

## Usage

```js
bot.match.callbackQuery('delete', (ctx) => {
  ctx.answerCallbackQuery({ text: 'Item deleted!' });
});

bot.match.callbackQuery('edit_item', (ctx, itemId, action) => {
  console.log(`Edit item ${itemId} with action ${action}`);
});
```

## Handler Parameters

- `ctx` - The context object with callback query data
- `...params` - Spread parameters extracted from callback data (if any)

## Callback Data Format

The plugin supports parsing callback data with optional parameters in JSON array format:

**Format:** `action[param1, param2, ...]`

Examples:
```js
'delete'                          // Simple action
'delete[42]'                      // Action with one parameter
'edit[123, "update"]'             // Action with multiple parameters
'action["id", true, 3.14]'        // Various parameter types
```

## Examples

### Simple Actions

```js
bot.match.callbackQuery('yes', (ctx) => {
  ctx.answerCallbackQuery({ text: 'You clicked YES' });
});

bot.match.callbackQuery('no', (ctx) => {
  ctx.answerCallbackQuery({ text: 'You clicked NO' });
});
```

### Actions with Parameters

```js
bot.match.callbackQuery('like', (ctx, postId) => {
  ctx.answerCallbackQuery({ text: `Liked post ${postId}` });
});

bot.match.callbackQuery('comment', (ctx, postId, replyTo) => {
  ctx.answerCallbackQuery({ text: `Replying to ${replyTo} on post ${postId}` });
});
```

### Regex Pattern Matching

```js
bot.match.callbackQuery(/^delete_/, (ctx) => {
  ctx.answerCallbackQuery({ text: 'Item will be deleted' });
});
```

### Multiple Actions with Chaining

```js
bot.match
  .callbackQuery('yes', yesHandler)
  .callbackQuery('no', noHandler)
  .callbackQuery('cancel', cancelHandler);
```

### Creating Inline Buttons

```js
ctx.sendMessage({
  text: 'What do you think?',
  reply_markup: {
    inline_keyboard: [
      [
        { text: 'Like', callback_data: 'like[42]' },
        { text: 'Comment', callback_data: 'comment[42, 10]' }
      ],
      [
        { text: 'Delete', callback_data: 'delete[42]' }
      ]
    ]
  }
});
```

### With composite plugin

```js
// Handle callback only from specific chat
bot.match.all([
  { callbackQuery: 'approve' },
  { chat: ADMIN_CHAT_ID }
], (ctx) => {
  ctx.answerCallbackQuery({ text: 'Request approved' });
});
```

## Type Safety with Parameters

When using parameters, ensure they are valid JSON:

```js
// ✅ Correct
callback_data: 'action[123]'              // number
callback_data: 'action["text"]'           // string (quoted)
callback_data: 'action[true, false]'      // boolean
callback_data: 'action[1, "a", true]'     // mixed types

// ❌ Incorrect
callback_data: 'action[unquoted]'         // JSON string must be quoted
callback_data: 'action[undefined]'        // undefined is not valid JSON
```

## Common Patterns

### Pagination

```js
// callback_data: 'page[2]'
bot.match.callbackQuery('page', (ctx, pageNum) => {
  showPage(ctx, pageNum);
});
```

### Item Management

```js
// callback_data: 'item_delete[123]'
bot.match.callbackQuery('item_delete', (ctx, itemId) => {
  deleteItem(itemId);
  ctx.answerCallbackQuery({ text: 'Item deleted' });
});
```

### Multi-step Actions

```js
// callback_data: 'confirm["delete", 42]'
bot.match.callbackQuery('confirm', (ctx, action, id) => {
  if (action === 'delete') {
    deleteItem(id);
  } else if (action === 'archive') {
    archiveItem(id);
  }
  ctx.answerCallbackQuery({ text: 'Action completed' });
});
```

## Notes

- Parameters are parsed as JSON, so strings must be quoted
- Callback data is limited to 64 bytes by Telegram
- Always provide user feedback with `ctx.answerCallbackQuery()`
- Parameters are spread into the handler function arguments
