export default {
  events: ['message', 'edited_message', 'channel_post', 'edited_channel_post', 'callback_query', 'my_chat_member', 'chat_member', 'chat_join_request'],
  plugin: (ctx, eventName, plugins) => {
    if (!('chat' in ctx) || ctx.chat.id === undefined)
      return;

    const chatId = ctx.chat.id;

    return (pattern, handler) => {
      if (typeof pattern === 'number' && pattern === chatId)
        return handler(ctx, eventName);
      
      if (typeof pattern === 'string' && pattern === String(chatId))
        return handler(ctx, eventName);
      
      if (pattern.constructor.name === 'RegExp' && pattern.test(String(chatId)))
        return handler(ctx, eventName);
      
      if (typeof pattern === 'function' && pattern(chatId))
        return handler(ctx, eventName);
    };
  }
}
