export default {
  events: ['message', 'channel_post'],
  plugin: (ctx, eventName, plugins) => {
    const text = ('text' in ctx ? ctx.text : null) || ('caption' in ctx ? ctx.caption : null);
    const entities = ('entities' in ctx ? ctx.entities : null) || ('caption_entities' in ctx ? ctx.caption_entities : null);

    if (!entities || !text) return;

    return (pattern, handler) => {
      const  createReduceHandler = (check) => (acc, entity) => {
        if (entity.type !== 'bot_command') return acc;

        const value = text.slice(entity.offset, entity.offset + entity.length);
        if (check(value))
          acc.push(value);
        return acc;
      };

      let reduceHandler;

      if (typeof pattern === 'string')
        reduceHandler = createReduceHandler((value) => pattern === value);

      if (pattern.constructor.name === 'RegExp')
        reduceHandler = createReduceHandler((value) => pattern.test(value));

      const commands = entities.reduce(reduceHandler, []);
      
      if (commands.length)
        return handler(ctx, ...commands);
    };
  }
}
