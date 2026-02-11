export default {
  events: ['message'],
  plugin: (ctx, check, eventName) => {
    if (!('entities' in ctx) || !ctx.text)
      return;

    for (const entity of ctx.entities) {
      // Extract entity value from message text using offset and length
      const value = ctx.text.slice(entity.offset, entity.offset + entity.length);
      check(entity.type)(ctx, entity.type, value);
    }
  }
}
