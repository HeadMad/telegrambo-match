# Chat Member Matcher

Match chat member status changes (user joins/leaves/promoted/demoted).

## Supported Pattern Types

- **String**: Exact member status match
  ```js
  { chatMember: 'member' }
  { chatMember: 'left' }
  { chatMember: 'kicked' }
  { chatMember: 'administrator' }
  ```
- **RegExp**: Regex pattern matching
  ```js
  { chatMember: /member|left/ }
  ```

## Plugin Structure

```js
export default {
  events: ['chat_member', 'my_chat_member'],
  plugin: (ctx, eventName, plugins) => {
    const status = ctx.new_chat_member?.status;
    
    if (!status) return;

    // Return matcher function (MUST return handler result)
    return (pattern, handler) => {
      if (typeof pattern === 'string' && pattern === status)
        return handler(ctx, status, ctx);  // ⚠️ MUST return
      
      if (pattern instanceof RegExp && pattern.test(status))
        return handler(ctx, status, ctx);  // ⚠️ MUST return
    };
  }
}
```

⚠️ **Important**: Handler result MUST be returned for compatibility with composite plugins like `all()` and `any()`.

## Initialization

```js
import setMatch, { chatMember } from 'telegrambo-match';

const bot = telegrambo(process.env.BOT_TOKEN);
bot.match = setMatch({
  chatMember
});
```

## Usage

```js
bot.match.chatMember('member', (ctx, status, data) => {
  console.log('User joined:', ctx.new_chat_member);
});

bot.match.chatMember('left', (ctx, status, data) => {
  console.log('User left:', ctx.old_chat_member);
});

bot.match.chatMember('administrator', (ctx, status, data) => {
  ctx.sendMessage({ text: 'Admin promoted!' });
});
```

## Handler Parameters

- `ctx` - The context object with chat member data
- `status` - The new member status (e.g., `member`, `left`, `kicked`, `administrator`)
- `data` - The full context object with old and new member states

## Supported Member Statuses

- `creator` - Chat creator
- `administrator` - Administrator
- `member` - Regular member (joined)
- `restricted` - User with restrictions
- `left` - User left the chat
- `kicked` - User was kicked from the chat

## Supported Events

### `chat_member` Event
Triggered when ANY user's status changes in the chat. Useful for tracking member activities.

### `my_chat_member` Event
Triggered when the BOT's status changes in the chat. Useful for tracking bot's own status.

## Examples

### Detect User Join

```js
bot.match.chatMember('member', (ctx, status, data) => {
  const user = ctx.new_chat_member.user;
  ctx.sendMessage({ text: `Welcome @${user.username || user.first_name}!` });
});
```

### Detect User Leave

```js
bot.match.chatMember('left', (ctx, status, data) => {
  const user = ctx.old_chat_member.user;
  ctx.sendMessage({ text: `${user.first_name} has left the chat` });
});
```

### Detect User Kick

```js
bot.match.chatMember('kicked', (ctx, status, data) => {
  const user = ctx.old_chat_member.user;
  ctx.sendMessage({ text: `${user.first_name} was removed from the chat` });
});
```

### Detect Admin Promotion

```js
bot.match.chatMember('administrator', (ctx, status, data) => {
  const user = ctx.new_chat_member.user;
  const oldStatus = ctx.old_chat_member.status;
  
  if (oldStatus !== 'administrator') {
    ctx.sendMessage({ text: `🎉 ${user.first_name} is now an administrator!` });
  }
});
```

### Track Bot Status

```js
bot.match.chatMember('member', (ctx, status, data) => {
  if (ctx.new_chat_member.user.is_bot) {
    ctx.sendMessage({ text: 'A bot has joined the chat!' });
  }
});

// Track when bot is added
bot.match.chatMember('member', (ctx, status, data) => {
  if (ctx.new_chat_member.user.id === ctx.from.id) {
    ctx.sendMessage({ text: 'I have been added to this chat!' });
  }
});

// Track when bot is removed
bot.match.chatMember('left', (ctx, status, data) => {
  if (ctx.old_chat_member.user.id === ctx.from.id) {
    console.log('Bot was removed from chat');
  }
});
```

### Multiple Status Changes with Chaining

```js
bot.match
  .chatMember('member', (ctx, status, data) => {
    ctx.sendMessage({ text: 'User joined' });
  })
  .chatMember('left', (ctx, status, data) => {
    ctx.sendMessage({ text: 'User left' });
  })
  .chatMember('kicked', (ctx, status, data) => {
    ctx.sendMessage({ text: 'User kicked' });
  })
  .chatMember('administrator', (ctx, status, data) => {
    ctx.sendMessage({ text: 'User promoted to admin' });
  });
```

### Regex Pattern Matching

```js
bot.match.chatMember(/member|left/, (ctx, status, data) => {
  ctx.sendMessage({ text: `Member status changed to: ${status}` });
});
```

### Permission Changes

```js
bot.match.chatMember('administrator', (ctx, status, data) => {
  const admin = ctx.new_chat_member;
  const permissions = [
    admin.can_delete_messages ? '🗑️' : '',
    admin.can_restrict_members ? '🚫' : '',
    admin.can_pin_messages ? '📌' : '',
    admin.can_change_info ? '✏️' : ''
  ].filter(Boolean);
  
  ctx.sendMessage({ text: `Admin permissions: ${permissions.join(' ')}` });
});
```

### Greeting Specific Users

```js
const VIP_USERS = [123456, 789012];

bot.match.chatMember('member', (ctx, status, data) => {
  const userId = ctx.new_chat_member.user.id;
  
  if (VIP_USERS.includes(userId)) {
    ctx.sendMessage({ text: '🌟 A VIP member has joined!' });
  }
});
```

### With composite plugin

```js
// Welcome new members only in specific group
bot.match.all([
  { chatMember: 'member' },
  { chat: WELCOME_GROUP_ID }
], (ctx, status, data) => {
  const user = ctx.new_chat_member.user;
  ctx.sendMessage({ text: `Welcome to our group, ${user.first_name}!` });
});
```

## Accessing Member Information

Both old and new states are available:

```js
bot.match.chatMember('administrator', (ctx, status, data) => {
  const newMember = ctx.new_chat_member;  // New state
  const oldMember = ctx.old_chat_member;  // Old state
  
  console.log('User:', newMember.user.id);
  console.log('Old status:', oldMember.status);
  console.log('New status:', newMember.status);
  console.log('Permissions:', newMember.can_delete_messages);
});
```

## Notes

- `chat_member` fires for any user status change
- `my_chat_member` fires only for the bot's own status changes
- Both events provide old and new member state information
- Permissions are included in admin and restricted statuses
