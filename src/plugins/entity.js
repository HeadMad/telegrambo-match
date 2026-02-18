export default {
  events: ['message', 'channel_post'],
  plugin: (ctx, eventName, plugins) => {
    const text = 'text' in ctx ? ctx.text : 'caption' in ctx ? ctx.caption : null;
    const entities = 'entities' in ctx ? ctx.entities : 'caption_entities' in ctx ? ctx.caption_entities : null;

    if (!entities || !text)
      return;

    const foundEntities = [];
    
    for (const entity of entities) {
      const value = text.slice(entity.offset, entity.offset + entity.length);
      foundEntities.push({ type: entity.type, value });
    }

    if (!foundEntities.length)
      return;

    return (pattern, handler) => {
      for (const { type, value } of foundEntities) {
        if (typeof pattern === 'string' && pattern === type)
          return handler(ctx, type, value);
        
        if (pattern.constructor.name === 'RegExp' && pattern.test(type))
          return handler(ctx, type, value);
      }
    };
  }
}
