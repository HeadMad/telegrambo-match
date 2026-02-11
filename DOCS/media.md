# Media Matcher

Match messages by media type (photo, video, audio, document, etc.).

## Plugin Structure

```js
const MEDIA_TYPES = ['photo', 'video', 'audio', 'document', 'voice', 'video_note', 'animation', 'sticker'];

export default {
  events: ['message'],
  plugin: (ctx, check, eventName) => {
    for (const mediaType of MEDIA_TYPES) {
      if (mediaType in ctx) {
        check(mediaType)(ctx, mediaType);
      }
    }
  }
}
```

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
  console.log('Photo received:', type);
});

bot.match.media('video', (ctx, type) => {
  console.log('Video received:', type);
});

bot.match.media('document', (ctx, type) => {
  console.log('Document received:', type);
});
```

## Supported Media Types

- `photo` - Image/photo
- `video` - Video file
- `audio` - Audio file
- `document` - Document (any file)
- `voice` - Voice message
- `video_note` - Video note (circular video)
- `animation` - GIF animation
- `sticker` - Sticker

## Handler Parameters

- `ctx` - The context object with message data
- `type` - The media type (e.g., `photo`, `video`, `audio`)

## Examples

### Handling Photos

```js
bot.match.media('photo', (ctx, type) => {
  const photo = ctx.photo[ctx.photo.length - 1]; // Get largest photo
  ctx.sendMessage({ text: `Photo received! ID: ${photo.file_id}` });
});
```

### Handling Documents

```js
bot.match.media('document', (ctx, type) => {
  ctx.sendMessage({ text: `Document: ${ctx.document.file_name} (${ctx.document.file_size} bytes)` });
});
```

### Handling Voice Messages

```js
bot.match.media('voice', (ctx, type) => {
  ctx.sendMessage({ text: `Voice message: ${ctx.voice.duration} seconds` });
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
  })
  .media('document', (ctx, type) => {
    ctx.sendMessage({ text: 'Document received!' });
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
  
  ctx.sendMessage({ text: 'File received and accepted!' });
});
```

## Media Object Structure

Each media type provides different properties:

### Photo

```js
{
  file_id: "string",
  file_unique_id: "string",
  width: number,
  height: number,
  file_size: number (optional)
}
```

### Video

```js
{
  file_id: "string",
  file_unique_id: "string",
  width: number,
  height: number,
  duration: number,
  thumbnail: PhotoSize (optional),
  mime_type: "string" (optional),
  file_size: number (optional)
}
```

### Audio

```js
{
  file_id: "string",
  file_unique_id: "string",
  duration: number,
  performer: "string" (optional),
  title: "string" (optional),
  mime_type: "string" (optional),
  file_size: number (optional)
}
```

### Document

```js
{
  file_id: "string",
  file_unique_id: "string",
  thumbnail: PhotoSize (optional),
  file_name: "string" (optional),
  mime_type: "string" (optional),
  file_size: number (optional)
}
```

### Voice

```js
{
  file_id: "string",
  file_unique_id: "string",
  duration: number,
  mime_type: "string" (optional),
  file_size: number (optional)
}
```

## Common Patterns

### File Type Validation

```js
bot.match.media('document', (ctx, type) => {
  const mimeType = ctx.document.mime_type;
  
  if (mimeType === 'application/pdf') {
    ctx.sendMessage({ text: 'PDF received!' });
  } else if (mimeType.startsWith('image/')) {
    ctx.sendMessage({ text: 'Image document received!' });
  } else {
    ctx.sendMessage({ text: 'Other document type' });
  }
});
```

### Media Download

```js
bot.match.media('photo', (ctx, type) => {
  const fileId = ctx.photo[ctx.photo.length - 1].file_id;
  // Use fileId to download via Telegram API
  ctx.sendMessage({ text: 'Photo saved!' });
});
```

### Gallery Handler

```js
bot.match
  .media('photo', handleMedia)
  .media('video', handleMedia)
  .media('animation', handleMedia);

function handleMedia(ctx, type) {
  ctx.sendMessage({ text: `${type.toUpperCase()} added to gallery` });
}
```

## Performance Notes

- Media matching is performed on every message
- Multiple media types in one message will trigger all matching handlers
- Media objects can be large, consider caching file IDs

## Notes

- A message can contain only one media type
- Use file_id for downloading or forwarding media
- file_size may not be available for all media types
- The `photo` type contains an array of PhotoSize objects (different qualities)
