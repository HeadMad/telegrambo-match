export default {
  events: ['message'],
  plugin: (ctx, check, eventName) => {
    if (!('entities' in ctx) || !ctx.text)
      return;

    for (const entity of ctx.entities) {
      if (entity.type === 'hashtag') {
        const value = ctx.text.slice(entity.offset, entity.offset + entity.length);
        check(value)(ctx, value);
      }
    }
  }
}
