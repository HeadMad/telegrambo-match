export default {
  events: ['message', 'edited_message', 'channel_post', 'edited_channel_post', 'callback_query', 'my_chat_member', 'chat_member', 'chat_join_request'],
  plugin: (ctx, check, eventName) => {
    // Check if ctx has chat info (telegrambo normalizes this)
    if (ctx.chat && ctx.chat.id !== undefined) {
      const chatId = ctx.chat.id;
      check(chatId)(ctx, eventName);
    }
  }
}
