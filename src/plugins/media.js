// Supported media types
const MEDIA_TYPES = ['photo', 'video', 'audio', 'document', 'voice', 'video_note', 'animation', 'sticker'];

export default {
  events: ['message'],
  plugin: (ctx, check, eventName) => {
    // Check each media type
    for (const mediaType of MEDIA_TYPES) {
      if (mediaType in ctx) 
        check(mediaType)(ctx, mediaType);
      
    }
  }
}
