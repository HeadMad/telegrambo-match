export default {
  events: ['chat_member', 'my_chat_member'],
  plugin: (ctx, check, eventName) => {
    const status = ctx.new_chat_member?.status;
    if (status) {
      check(status)(ctx, status, ctx);
    }
  }
}
