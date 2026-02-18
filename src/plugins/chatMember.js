export default {
  events: ['chat_member', 'my_chat_member'],
  plugin: (ctx, eventName, plugins) => {
    const status = ctx.new_chat_member?.status;
    
    if (!status)
      return;

    return (pattern, handler) => {
      if (typeof pattern === 'string' && pattern === status)
        return handler(ctx, status, ctx);
      
      if (pattern.constructor.name === 'RegExp' && pattern.test(status))
        return handler(ctx, status, ctx);
    };
  }
}
