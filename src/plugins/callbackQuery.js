export default {
  events: ['callback_query'],
  plugin: (ctx, check, eventName) => {
    const data = ctx.data;
    let action = data;
    let params = [];

    const offset = data.indexOf('[');

    if (offset !== -1) {
      action = data.substring(0, offset);
      params = JSON.parse(data.substring(offset));
    }

    check(action.trim())(ctx, ...params);
  }
}
