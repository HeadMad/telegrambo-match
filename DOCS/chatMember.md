# Chat Member Matcher

Match chat member status changes (user joins/leaves/promoted/demoted).

## Plugin Structure

```js
export default {
  events: ['chat_member', 'my_chat_member'],
  plugin: (ctx, check, eventName) => {
    const status = ctx.new_chat_member?.status;
    if (status) {
      check(status)(ctx, status, ctx);
    }
  }
}
```

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
  ctx.reply('Admin promoted!');
});
```

## Handler Parameters

- `ctx` - The context object with chat member data
- `status` - The new member status (e.g., `member`, `left`, `administrator`)
- `chatMemberData` - The full chat member object with old and new states

## Supported Member Statuses

- `creator` - Chat creator
- `administrator` - Administrator
- `member` - Regular member (joined)
- `restricted` - User with restrictions
- `left` - User left the chat
- `kicked` - User was kicked from the chat

## Events

The plugin listens to two event types:

### `chat_member` Event
- Triggered when ANY user's status changes in the chat
- Useful for tracking member activities

### `my_chat_member` Event
- Triggered when the BOT's status changes in the chat
- Useful for tracking bot's own status

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

### Multiple Status Changes

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
    ctx.sendMessage({ text: 'User promoted' });
  });
```

## Chat Member Object Structure

```js
{
  user: {
    id: number,
    is_bot: boolean,
    first_name: string,
    last_name: string (optional),
    username: string (optional),
    language_code: string (optional)
  },
  status: string,  // 'creator', 'administrator', 'member', 'restricted', 'left', 'kicked'
  is_member: boolean (optional),
  can_send_messages: boolean (optional),
  can_send_audios: boolean (optional),
  can_send_documents: boolean (optional),
  can_send_photos: boolean (optional),
  can_send_videos: boolean (optional),
  can_send_video_notes: boolean (optional),
  can_send_voice_notes: boolean (optional),
  can_send_polls: boolean (optional),
  can_send_other_messages: boolean (optional),
  can_add_web_page_previews: boolean (optional),
  can_change_info: boolean (optional),
  can_invite_users: boolean (optional),
  can_pin_messages: boolean (optional),
  can_manage_topics: boolean (optional),
  until_date: number (optional)
}
```

## Common Patterns

### Welcome New Members

```js
bot.match.chatMember('member', (ctx, status, data) => {
  const user = ctx.new_chat_member.user;
  
  ctx.sendMessage({
    text: `Welcome @${user.username || user.first_name}! 👋\n\nPlease introduce yourself!`,
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Read Rules', url: 'https://example.com/rules' }]
      ]
    }
  });
});
```

### Moderation Log

```js
const log = [];

match.chatMember(/#(kicked|left|administrator)/, (ctx, status, data) => {
  log.push({
    timestamp: new Date(),
    user: data.new_chat_member.user.username,
    action: status,
    chatId: ctx.chat.id
  });
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

## Permissions and Restrictions

The `administrator` and `restricted` statuses include permission booleans:

```js
match.chatMember('administrator', (ctx, status, data) => {
  const perms = data.new_chat_member;
  
  if (perms.can_delete_messages) {
    console.log('Can delete messages');
  }
  if (perms.can_restrict_members) {
    console.log('Can restrict members');
  }
  if (perms.can_promote_members) {
    console.log('Can promote members');
  }
});
```

## Notes

- `chat_member` events may not be enabled by default in some chats
- Administrator can enable/disable member status updates in group settings
- Only group, supergroup, and channel events are supported
- The bot must have access to see member status changes
- Private chats do not have member status events
- Use `my_chat_member` to track bot's own status in the chat
