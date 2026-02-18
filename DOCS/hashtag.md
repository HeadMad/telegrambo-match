# Hashtag Matcher

Match #hashtags in messages and captions.

## Supported Pattern Types

- **String**: Exact hashtag match
  ```js
  { hashtag: '#python' }
  ```
- **RegExp**: Regex pattern matching
  ```js
  { hashtag: /#python|#javascript/ }
  ```

## Plugin Structure

```js
export default {
  events: ['message', 'channel_post'],
  plugin: (ctx, eventName, plugins) => {
    const text = ctx.text || ctx.caption;
    const entities = ctx.entities || ctx.caption_entities;

    if (!entities || !text) return;

    const foundHashtags = [];
    
    for (const entity of entities) {
      if (entity.type === 'hashtag') {
        const value = text.slice(entity.offset, entity.offset + entity.length);
        foundHashtags.push(value);
      }
    }

    if (!foundHashtags.length) return;

    // Return matcher function (MUST return handler result)
    return (pattern, handler) => {
      for (const hashtag of foundHashtags) {
        if (typeof pattern === 'string' && pattern === hashtag)
          return handler(ctx, hashtag);  // ⚠️ MUST return
        
        if (pattern instanceof RegExp && pattern.test(hashtag))
          return handler(ctx, hashtag);  // ⚠️ MUST return
      }
    };
  }
}
```

⚠️ **Important**: Handler result MUST be returned for compatibility with composite plugins like `all()` and `any()`.

## Initialization

```js
import setMatch, { hashtag } from 'telegrambo-match';

const bot = telegrambo(process.env.BOT_TOKEN);
bot.match = setMatch({
  hashtag
});
```

## Usage

```js
bot.match.hashtag('#python', (ctx, tag) => {
  ctx.sendMessage({ text: `Python topic: ${tag}` });
});

bot.match.hashtag('#help', (ctx, tag) => {
  ctx.sendMessage({ text: 'Help requested' });
});
```

## Handler Parameters

- `ctx` - The context object with message data
- `tag` - The hashtag including # (e.g., `#python`)

## Examples

### Detect Specific Hashtag

```js
bot.match.hashtag('#help', (ctx, tag) => {
  ctx.sendMessage({ text: 'Help topic initiated!' });
});
```

### Log All Hashtags

```js
bot.match.hashtag(/#\w+/, (ctx, tag) => {
  console.log(`Hashtag used: ${tag}`);
});
```

### Multiple Hashtags with Chaining

```js
bot.match
  .hashtag('#python', (ctx, tag) => {
    ctx.sendMessage({ text: 'Python discussion!' });
  })
  .hashtag('#javascript', (ctx, tag) => {
    ctx.sendMessage({ text: 'JavaScript discussion!' });
  })
  .hashtag('#help', (ctx, tag) => {
    ctx.sendMessage({ text: 'Help requested!' });
  });
```

### Hashtag Categorization

```js
const categories = {
  '#python': 'programming',
  '#help': 'support',
  '#news': 'announcements'
};

bot.match.hashtag(/#\w+/, (ctx, tag) => {
  const category = categories[tag] || 'other';
  ctx.sendMessage({ text: `Category: ${category}` });
});
```

### Hashtag Statistics

```js
const hashtagStats = {};

bot.match.hashtag(/#\w+/, (ctx, tag) => {
  hashtagStats[tag] = (hashtagStats[tag] || 0) + 1;
  
  if (hashtagStats[tag] % 10 === 0) {
    ctx.sendMessage({ text: `${tag} has been used 10 times!` });
  }
});
```

### Hashtag Validation

```js
const allowedHashtags = ['#help', '#support', '#feature', '#bug'];

bot.match.hashtag(/#\w+/, (ctx, tag) => {
  if (!allowedHashtags.includes(tag)) {
    ctx.sendMessage({ text: `${tag} is not an allowed hashtag` });
    return;
  }
  
  ctx.sendMessage({ text: `${tag} is valid!` });
});
```

### With composite plugin

```js
// Match hashtags only in public channels
bot.match.all([
  { hashtag: /#\w+/ },
  { chat: /^-100/ }  // Supergroups and channels
], (ctx, tag) => {
  ctx.sendMessage({ text: `Channel hashtag: ${tag}` });
});
```

## Notes

- Hashtags must start with `#` character
- Hashtags are case-sensitive in matching
- Multiple hashtags in one message trigger the handler multiple times
- Works in private chats, groups, and channels
- Works with both message text and channel post captions
