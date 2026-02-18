export default {
  events: ['callback_query'],
  plugin: (ctx, eventName, plugins) => {
    if (!('data' in ctx))
      return;

    const data = ctx.data;
    let action = data;
    let params = [];

    const offset = data.indexOf('[');

    if (offset !== -1) {
      action = data.substring(0, offset);
      params = JSON.parse(data.substring(offset));
    }

    return (pattern, handler) => {
      const trimmedAction = action.trim();
      
      if (typeof pattern === 'string' && pattern === trimmedAction)
        return handler(ctx, ...params);
      
      if (pattern.constructor.name === 'RegExp' && pattern.test(trimmedAction))
        return handler(ctx, ...params);
    };
  }
}
