export default {
  events: ['message', 'channel_post'],
  plugin: (ctx, eventName, plugins) => {
    const value = ('text' in ctx ? ctx.text : null) || ('caption' in ctx ? ctx.caption : null);
    
    if (!value)
      return;
    
    return (pattern, handler) => {
      if (typeof pattern === 'string' && pattern === value)
        return handler(ctx, value);
      
      if (pattern.constructor.name === 'RegExp' && pattern.test(value))
        return handler(ctx, value);
    }
  }
}
