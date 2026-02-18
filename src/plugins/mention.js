export default {
  events: ['message', 'channel_post'],
  plugin: (ctx, eventName, plugins) => {
    const text = ('text' in ctx ? ctx.text : null) || ('caption' in ctx ? ctx.caption : null);
    const entities = ('entities' in ctx ? ctx.entities : null) || ('caption_entities' in ctx ? ctx.caption_entities : null);

    if (!entities || !text)
      return;

    const foundMentions = [];
    
    for (const entity of entities) {
      if (entity.type === 'mention') {
        const value = text.slice(entity.offset, entity.offset + entity.length);
        foundMentions.push(value);
      }
    }

    if (!foundMentions.length)
      return;

    return (pattern, handler) => {
      for (const mention of foundMentions) {
        if (typeof pattern === 'string' && pattern === mention)
          return handler(ctx, mention);
        
        if (pattern.constructor.name === 'RegExp' && pattern.test(mention))
          return handler(ctx, mention);
      }
    };
  }
}
