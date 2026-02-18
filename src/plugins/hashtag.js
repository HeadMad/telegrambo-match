export default {
  events: ['message', 'channel_post'],
  plugin: (ctx, eventName, plugins) => {
    const text = ('text' in ctx ? ctx.text : null) || ('caption' in ctx ? ctx.caption : null);
    const entities = ('entities' in ctx ? ctx.entities : null) || ('caption_entities' in ctx ? ctx.caption_entities : null);

    if (!entities || !text)
      return;

    const foundHashtags = [];
    
    for (const entity of entities) {
      if (entity.type === 'hashtag') {
        const value = text.slice(entity.offset, entity.offset + entity.length);
        foundHashtags.push(value);
      }
    }

    if (!foundHashtags.length)
      return;

    return (pattern, handler) => {
      for (const hashtag of foundHashtags) {
        if (typeof pattern === 'string' && pattern === hashtag)
          return handler(ctx, hashtag);
        
        if (pattern.constructor.name === 'RegExp' && pattern.test(hashtag))
          return handler(ctx, hashtag);
      }
    };
  }
}
