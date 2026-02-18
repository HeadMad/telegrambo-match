# Media Matcher

Match messages by media type (photo, video, audio, document, etc.).

## Supported Pattern Types

- **String**: Exact media type match
  ```js
  { media: 'photo' }
  { media: 'video' }
  { media: 'document' }
  ```
- **RegExp**: Regex pattern matching
  ```js
  { media: /photo|video/ }
  ```

## Plugin Structure

```js
const MEDIA_TYPES = ['photo', 'video', 'audio', 'document', 'voice', 'video_note', 'animation', 'sticker'];

export default {
  events: ['message'],
  plugin: (ctx, eventName, plugins) => {
    for (const mediaType of MEDIA_TYPES) {
      if (mediaType in ctx) {
        // Return matcher function (MUST return handler result)
        return (pattern, handler) => {
          if (typeof pattern === 'string' && pattern === mediaType)
            return handler(ctx, mediaType);  // ⚠️ MUST return
          
          if (pattern instanceof RegExp && pattern.test(mediaType))
            return handler(ctx, mediaType);  // ⚠️ MUST return
        };
      }
    }
  }
}
```

⚠️ **Important**: Handler result MUST be returned for compatibility with composite plugins like `all()` and `any()`.

## Initialization

```js
import setMatch, { media } from 'telegrambo-match';

const bot = telegrambo(process.env.BOT_TOKEN);
bot.match = setMatch({
  media
});
```

## Usage

```js
bot.match.media('photo', (ctx, type) => {
  ctx.sendMessage({ text: 'Photo received!' });
});

bot.match.media('video', (ctx, type) => {
  ctx.sendMessage({ text: 'Video received!' });
});
```

## Handler Parameters

- `ctx` - The context object with message data
- `type` - The media type (e.g., `photo`, `video`, `audio`)

## Supported Media Types

- `photo` - Image/photo
- `video` - Video file
- `audio` - Audio file
- `document` - Document (any file)
- `voice` - Voice message
- `video_note` - Video note (circular video)
- `animation` - GIF animation
- `sticker` - Sticker

## Examples

### Handling Photos

```js
bot.match.media('photo', (ctx, type) => {
  const photo = ctx.photo[ctx.photo.length - 1];
  ctx.sendMessage({ text: `Photo received! ID: ${photo.file_id}` });
});
```

### Handling Documents

```js
bot.match.media('document', (ctx, type) => {
  ctx.sendMessage({ text: `Document: ${ctx.document.file_name}` });
});
```

### Handling Voice Messages

```js
bot.match.media('voice', (ctx, type) => {
  ctx.sendMessage({ text: `Voice message: ${ctx.voice.duration}s` });
});
```

### Multiple Media Types with Chaining

```js
bot.match
  .media('photo', (ctx, type) => {
    ctx.sendMessage({ text: 'Image received!' });
  })
  .media('video', (ctx, type) => {
    ctx.sendMessage({ text: 'Video received!' });
  })
  .media('audio', (ctx, type) => {
    ctx.sendMessage({ text: 'Audio received!' });
  });
```

### Regex pattern matching

```js
bot.match.media(/photo|video|document/, (ctx, type) => {
  ctx.sendMessage({ text: `Media type: ${type}` });
});
```

### File Size Validation

```js
bot.match.media('document', (ctx, type) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (ctx.document.file_size > maxSize) {
    ctx.sendMessage({ text: 'File too large!' });
    return;
  }
  
  ctx.sendMessage({ text: 'File accepted!' });
});
```

### With composite plugin

```js
// Accept media only in specific chat
bot.match.all([
  { media: /photo|video/ },
  { chat: MEDIA_CHANNEL_ID }
], (ctx, type) => {
  ctx.sendMessage({ text: `${type} added to channel` });
});
```

## Notes

- A message can contain only one media type at a time
- Use file_id for downloading or forwarding media
- file_size may not be available for all media types
- The `photo` type contains an array of PhotoSize objects (different qualities)
