# Hashtag Matcher

Match #hashtags in messages.

## Plugin Structure

```js
export default {
  events: ['message'],
  plugin: (ctx, check, eventName) => {
    if (!('entities' in ctx) || !ctx.text)
      return;

    for (const entity of ctx.entities) {
      if (entity.type === 'hashtag') {
        const value = ctx.text.slice(entity.offset, entity.offset + entity.length);
        check(value)(ctx, value);
      }
    }
  }
}
```

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
  console.log('Hashtag found:', tag);
});

bot.match.hashtag('#help', (ctx, tag) => {
  ctx.sendMessage({ text: `You used the ${tag} hashtag!` });
});
```

## Handler Parameters

- `ctx` - The context object with message data
- `tag` - The hashtag including # (e.g., `#python`)

## How It Works

The hashtag matcher:
1. Checks if the message contains `hashtag` entities
2. Extracts the hashtag text from the message using entity offset and length
3. Calls registered handlers for matching hashtags
4. All matching handlers are called (not just the first one)

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

## Message Structure

When a message contains hashtags, Telegram provides entity data:

```js
{
  text: "Check out #python and #javascript tips",
  entities: [
    { type: "hashtag", offset: 10, length: 7 },   // #python
    { type: "hashtag", offset: 22, length: 11 }   // #javascript
  ]
}
```

The hashtag matcher extracts these automatically.

## Common Patterns

### Trending Hashtags

```js
const trendingHashtags = {};

match.hashtag(/#\w+/, (ctx, tag) => {
  trendingHashtags[tag] = (trendingHashtags[tag] || 0) + 1;
});

// Get top 5 trending
const top5 = Object.entries(trendingHashtags)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
```

### Content Organization

```js
const contentDB = {};

match.hashtag(/#\w+/, (ctx, tag) => {
  if (!contentDB[tag]) {
    contentDB[tag] = [];
  }
  contentDB[tag].push({
    user: ctx.from.username,
    text: ctx.text,
    timestamp: new Date()
  });
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

### Auto-Response by Hashtag

```js
const responses = {
  '#hello': 'Hello there! 👋',
  '#bye': 'See you later! 👋',
  '#help': 'How can I assist you?'
};

bot.match.hashtag(/#\w+/, (ctx, tag) => {
  if (responses[tag]) {
    ctx.sendMessage({ text: responses[tag] });
  }
});
```

## Entity Structure

Telegram provides hashtag entities with:
- `type` - Always "hashtag" for this matcher
- `offset` - Position in text where hashtag starts
- `length` - Length of the hashtag text (including #)

## Performance Notes

- Hashtag matching is performed on every message
- Multiple hashtags in one message trigger handler multiple times
- Consider caching hashtag patterns if tracking many

## Notes

- Hashtags must start with `#` character
- Hashtags are case-sensitive in matching
- Hashtags can contain letters, numbers, and underscores
- Multiple hashtags in one message are all extracted
- Works in private chats, groups, and channels
- Requires message to have text and entities
- The hashtag includes the # symbol
