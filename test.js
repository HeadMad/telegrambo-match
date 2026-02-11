import telegrambo from 'telegrambo';
import polling from 'telegrambo-polling';
import setMatch, { text, command, entity, chat, similarity, callbackQuery} from './index.js';

const bot = telegrambo(process.env.BOT_TOKEN);


bot.polling = polling;

const match = setMatch({
  chat,
  entity,
  text,
  command,
  callbackQuery,
  similarity: similarity({ threshold: 0.12, caseInsensitive: true })
})(bot);

match.chat(227295372, async (ctx, eventName) => {
  await ctx.sendMessage({
    text: eventName
  });
});


match.text(/hi/, (ctx, value) => {
  ctx.sendMessage({
    text: 'Привет, как дела?!'
  });
})
.text('btn', (ctx) => {
  ctx.sendMessage({
    text: 'Нажми кнопку',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Кнопка 1', callback_data: 'btn1' + JSON.stringify(['hello', true, ctx.from.id]) }],
        [{ text: 'Кнопка 2', callback_data: 'btn2 ' + JSON.stringify(['hi', false, ctx.chat.type]) }],
        [{ text: 'мой ID', callback_data: 'myId' }]
      ]
    }
  });
})
.callbackQuery('btn1', (ctx, ...params) => {
  ctx.sendMessage({
    text: 'Вы нажали кнопку 1 ' + JSON.stringify(params)
  });
})
.callbackQuery('btn2', (ctx, ...params) => {
  ctx.sendMessage({
    text: 'Вы нажали кнопку 2 ' + JSON.stringify(params)
  });
})
.callbackQuery('myId', (ctx, id) => {
  ctx.answerCallbackQuery({
    text: `Ваш ID: ` + ctx.from.id,
    parse_mode: 'HTML',
    show_alert: true
  });
})


match.entity('bot_command', (ctx, type, value) => {
  ctx.sendMessage({
    text: `Bot command: ${value}`
  });
})
.entity('mention', (ctx, type, value) => {
  ctx.sendMessage({
    text: `Mentioned: ${value}`
  });
})
.entity('hashtag', (ctx, type, value) => {
  ctx.sendMessage({
    text: `Hashtag: ${value}`
  });
});

match.command('/start', (ctx, value) => {
  ctx.sendMessage({
    text: 'Добро пожаловать!'
  });
});

match.similarity('hello', (ctx, text, score) => {
  ctx.sendMessage({
    text: `Matched "hello" with ${(score * 100).toFixed(1)}% similarity`
  });
})
.similarity('help me', (ctx, text, score) => {
  ctx.sendMessage({
    text: `Need help? Matched with ${(score * 100).toFixed(1)}% similarity`
  });
});

bot.polling({timeout: 20});