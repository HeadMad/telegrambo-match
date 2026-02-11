export default {
  events: ['message'],
  plugin: (ctx, check, eventName) => {
    if (!('entities' in ctx))
      return;

    for (const entity of ctx.entities) {
      if (entity.type === 'bot_command' && entity.offset === 0) {
        const command = ctx.text.slice(entity.offset, entity.offset + entity.length);
        return check(command)(ctx, command);
      }
    }
  }
}
