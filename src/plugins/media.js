const MEDIA_TYPES = ['photo', 'video', 'audio', 'document', 'voice', 'video_note', 'animation', 'sticker'];

export default {
  events: ['message'],
  plugin: (ctx, eventName, plugins) => {
    for (const mediaType of MEDIA_TYPES) {
      if (mediaType in ctx) {
        return (pattern, handler) => {
          if (typeof pattern === 'string' && pattern === mediaType)
            return handler(ctx, mediaType);
          
          if (pattern.constructor.name === 'RegExp' && pattern.test(mediaType))
            return handler(ctx, mediaType);
        };
      }
    }
  }
}
