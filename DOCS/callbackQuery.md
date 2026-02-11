# Callback Query Matcher

Match callback queries from inline buttons with support for action parsing and parameters.

## Plugin Structure

```js
export default {
  events: ['callback_query'],
  plugin: (ctx, check, eventName) => {
    const data = ctx.data;
    let action = data;
    let params = [];

    const offset = data.indexOf('[');

    if (offset !== -1) {
      action = data.substring(0, offset);
      params = JSON.parse(data.substring(offset));
    }

    check(action.trim())(ctx, ...params);
  }
}
```

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
bot.match.callbackQuery('delete', (ctx, ...params) => {
  ctx.answerCallbackQuery('Item deleted!');
});

bot.match.callbackQuery('edit_item', (ctx, itemId, action) => {
  console.log(`Edit item ${itemId} with action ${action}`);
});
```

## Callback Data Format

The plugin supports two formats:

### Simple Action (no parameters)

```js
// Button callback_data: "delete"
match.callbackQuery('delete', (ctx) => {
  ctx.answerCallbackQuery('Deleted!');
});
```

### Action with Parameters

```js
// Button callback_data: "edit_item[123, \"update\"]"
match.callbackQuery('edit_item', (ctx, itemId, action) => {
  console.log(`Item ID: ${itemId}, Action: ${action}`);
  ctx.answerCallbackQuery(`Editing item ${itemId}`);
});
```

## Handler Parameters

- `ctx` - The context object with callback query data
- `...params` - Spread parameters extracted from callback data (if any)

## Callback Data Structure

**Format:** `action[param1, param2, ...]`

The plugin parses callback data as follows:

1. **Extract action**: Text before `[`
2. **Extract parameters**: JSON array between `[` and `]`
3. **Trim action**: Remove whitespace from action
4. **Parse JSON**: Convert JSON array to individual parameters

**Examples:**

| Callback Data | Action | Parameters |
|---------------|--------|------------|
| `"delete"` | `"delete"` | `[]` |
| `"delete[42]"` | `"delete"` | `[42]` |
| `"edit[123, \"update\"]"` | `"edit"` | `[123, "update"]` |
| `"action[\"id\", true, 3.14]"` | `"action"` | `["id", true, 3.14]` |

## Usage Examples

### Simple Actions

```js
bot.match
  .callbackQuery('yes', (ctx) => {
    ctx.answerCallbackQuery({ text: 'You clicked YES' });
  })
  .callbackQuery('no', (ctx) => {
    ctx.answerCallbackQuery({ text: 'You clicked NO' });
  })
  .callbackQuery('cancel', (ctx) => {
    ctx.answerCallbackQuery({ text: 'Cancelled' });
  });
```

### Actions with Parameters

```js
bot.match
  .callbackQuery('like', (ctx, postId) => {
    ctx.answerCallbackQuery({ text: `Liked post ${postId}` });
  })
  .callbackQuery('comment', (ctx, postId, replyTo) => {
    ctx.answerCallbackQuery({ text: `Commenting on post ${postId}, reply to ${replyTo}` });
  });
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

## Type Safety with Parameters

When using parameters, ensure they are valid JSON:

```js
// ✅ Correct
callback_data: 'action[123]'           // number
callback_data: 'action["text"]'        // string
callback_data: 'action[true, false]'   // boolean
callback_data: 'action[1, "a", true]'  // mixed

// ❌ Incorrect
callback_data: 'action[unquoted]'      // JSON string must be quoted
callback_data: 'action[undefined]'     // undefined is not valid JSON
```

## Performance Notes

- Action matching is exact (no regex or partial matching)
- Whitespace in action names is trimmed
- JSON parsing happens for each callback query
- Keep callback_data under 64 bytes (Telegram limit)

## Common Patterns

### Pagination

```js
// Button: callback_data: 'page[2]'
match.callbackQuery('page', (ctx, pageNum) => {
  showPage(ctx, pageNum);
});
```

### Item Management

```js
// Button: callback_data: 'item_delete[123]'
match.callbackQuery('item_delete', (ctx, itemId) => {
  deleteItem(itemId);
  ctx.answerCallbackQuery('Item deleted');
});
```

### Multi-step Actions

```js
// Button: callback_data: 'confirm[\"delete\", 42]'
match.callbackQuery('confirm', (ctx, action, id) => {
  if (action === 'delete') {
    deleteItem(id);
  } else if (action === 'archive') {
    archiveItem(id);
  }
  ctx.answerCallbackQuery('Action completed');
});
```

## Notes

- The plugin requires valid JSON in parameters
- Action names are trimmed of whitespace
- Parameters are spread into the handler function
- Callback data is limited to 64 bytes by Telegram
- Always provide user feedback with `ctx.answerCallbackQuery()`
