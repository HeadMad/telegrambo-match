export default {
  events: ['message'],
  plugin: (ctx, check, eventName) => {
    if ('text' in ctx) {
      return check(ctx.text)(ctx, ctx.text);
    }
  }
}
